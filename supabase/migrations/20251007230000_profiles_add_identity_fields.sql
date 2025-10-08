-- Extend profiles with identity and onboarding fields
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists date_of_birth date,
  add column if not exists onboarding_completed_at timestamptz;

-- Basic sanity: DOB must not be in the future
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_profiles_dob_past'
  ) then
    alter table public.profiles
      add constraint chk_profiles_dob_past check (date_of_birth is null or date_of_birth <= current_date);
  end if;
end$$;

-- Backfill full_name from name if empty
update public.profiles
set full_name = nullif(btrim(coalesce(full_name, name, '')), '')
where (full_name is null or btrim(full_name) = '');

