-- Addresses and Profile Addresses schema for normalized address management
-- Ensures strong normalization (3NF/BCNF), immutability of address value-objects,
-- single current primary per kind, and non-overlapping validity windows.

-- Required extensions
create extension if not exists pgcrypto; -- gen_random_uuid
create extension if not exists "btree_gist"; -- for exclusion constraints with ranges

-- Domain: address_kind (prevents typos, aids constraints)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'address_kind') then
    create type public.address_kind as enum ('billing','shipping','contact','other');
  end if;
end$$;

-- Value object: addresses (immutable)
create table if not exists public.addresses (
  address_id uuid primary key default gen_random_uuid(),
  line1 text not null check (length(btrim(line1)) > 0),
  line2 text null,
  city text not null check (length(btrim(city)) > 0),
  region text null,
  postal_code text not null check (length(btrim(postal_code)) > 0),
  country char(2) not null check (country ~ '^[A-Za-z]{2}$'),
  -- Canonicalized hash for dedupe (lower/trim whitespace; uppercase country/postal)
  address_hash text generated always as (
    md5(
      lower(regexp_replace(coalesce(line1,''), '\\s+', ' ', 'g')) || '|' ||
      lower(regexp_replace(coalesce(line2,''), '\\s+', ' ', 'g')) || '|' ||
      lower(regexp_replace(coalesce(city,''), '\\s+', ' ', 'g')) || '|' ||
      lower(regexp_replace(coalesce(region,''), '\\s+', ' ', 'g')) || '|' ||
      upper(regexp_replace(coalesce(postal_code,''), '\\s+', '', 'g')) || '|' ||
      upper(country)
    )
  ) stored,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Enforce one canonical row per normalized address
create unique index if not exists ux_addresses_hash on public.addresses(address_hash);

-- Immutable addresses: disallow UPDATEs (insert new + re-associate instead)
create or replace function public.prevent_address_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Addresses are immutable; insert a new address and reassociate.';
end;
$$;

drop trigger if exists trg_prevent_address_update on public.addresses;
create trigger trg_prevent_address_update
before update on public.addresses
for each row execute function public.prevent_address_update();

-- Link: profile_addresses (with role and history semantics)
create table if not exists public.profile_addresses (
  profile_address_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  address_id uuid not null references public.addresses(address_id) on delete restrict,
  kind public.address_kind not null,
  is_primary boolean not null default false,
  valid_from timestamptz not null default timezone('utc'::text, now()),
  valid_to timestamptz null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  -- Basic temporal sanity
  constraint chk_pa_valid_range check (valid_to is null or valid_to > valid_from),
  -- Only current rows (valid_to is null) may be marked primary
  constraint chk_pa_primary_current_only check (is_primary = false or valid_to is null)
);

-- Only one current primary per (user_id, kind)
create unique index if not exists ux_pa_primary_current on public.profile_addresses(user_id, kind)
  where is_primary and valid_to is null;

-- No overlapping validity windows for the same (user_id, kind)
-- Requires btree_gist; use inclusive range on both ends
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ex_pa_no_overlap'
  ) then
    alter table public.profile_addresses
      add constraint ex_pa_no_overlap
      exclude using gist (
        user_id with =,
        kind with =,
        tstzrange(valid_from, coalesce(valid_to, 'infinity'::timestamptz), '[]') with &&
      );
  end if;
end$$;

-- Useful lookup indexes
create index if not exists idx_pa_user_kind_primary on public.profile_addresses(user_id, kind, is_primary);
create index if not exists idx_pa_address on public.profile_addresses(address_id);

-- updated_at maintenance for profile_addresses
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end$$;

drop trigger if exists trg_pa_set_updated_at on public.profile_addresses;
create trigger trg_pa_set_updated_at
before update on public.profile_addresses
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.addresses enable row level security;
alter table public.profile_addresses enable row level security;

-- Policies: profile_addresses owner-only CRUD
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profile_addresses' and policyname='PA owner select'
  ) then
    create policy "PA owner select" on public.profile_addresses for select to authenticated
      using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profile_addresses' and policyname='PA owner insert'
  ) then
    create policy "PA owner insert" on public.profile_addresses for insert to authenticated
      with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profile_addresses' and policyname='PA owner update'
  ) then
    create policy "PA owner update" on public.profile_addresses for update to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profile_addresses' and policyname='PA owner delete'
  ) then
    create policy "PA owner delete" on public.profile_addresses for delete to authenticated
      using (auth.uid() = user_id);
  end if;
end$$;

-- Policies: addresses
-- Readable only if linked to caller through profile_addresses
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='Addresses readable via profile link'
  ) then
    create policy "Addresses readable via profile link" on public.addresses for select to authenticated
      using (exists (
        select 1 from public.profile_addresses pa
        where pa.address_id = addresses.address_id and pa.user_id = auth.uid()
      ));
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='Addresses insertable by authenticated'
  ) then
    create policy "Addresses insertable by authenticated" on public.addresses for insert to authenticated
      with check (true);
  end if;
  -- No update/delete policies: immutable by design and not deletable by regular users
end$$;

-- Grant privileges (RLS still governs row access)
grant select, insert on public.addresses to authenticated;
grant select, insert, update, delete on public.profile_addresses to authenticated;

