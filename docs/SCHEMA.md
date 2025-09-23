# Schema Conventions (Supabase)

- Prefer `public.profiles` as the canonical user reference for all app tables.
- Avoid referencing `auth.users` directly from application tables unless there is a strong reason.
  - Rationale: `profiles` extends user metadata, simplifies joins and RLS, and isolates the app from `auth` internals.

## Standard pattern for user-owned tables

Use this template when a table is owned by a user:

```sql
-- Example table owned by a user
create table if not exists public.example_table (
  example_id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  -- other columns...
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

create index if not exists idx_example_table_user_id on public.example_table(user_id);
```

## Current core tables

```sql
-- Profiles (extends auth.users)
-- Already present. Do not FK to auth.users from app tables; FK to profiles instead.

-- Portfolios
create table if not exists public.portfolios (
  portfolio_id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  name varchar not null check (name <> ''),
  description text,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);
create index if not exists idx_portfolios_user_id on public.portfolios(user_id);

-- Tasks (existing) + portfolio link
alter table public.tasks
  add column if not exists portfolio_id uuid references public.portfolios(portfolio_id) on delete set null;
create index if not exists idx_tasks_portfolio_id on public.tasks(portfolio_id);
```

## RLS policy guidance

If Row Level Security (RLS) is enabled, restrict rows by `profiles.user_id`:

```sql
-- Enable RLS
alter table public.portfolios enable row level security;
alter table public.tasks enable row level security;

-- Portfolio ownership policy
create policy "Portfolios are accessible by owner" on public.portfolios
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Tasks restricted by owner (and optionally by portfolio)
create policy "Tasks are accessible by owner" on public.tasks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

Note: `auth.uid()` produces the authenticated user ID; we compare it against `profiles.user_id` stored on each row.

## When to reference auth.users

- Only in the `profiles` table itself (1:1 with `auth.users`) or in migration logic/triggers that react to auth events.
- Do not foreign-key app tables to `auth.users` directly.

## Anti-patterns to avoid

- Creating a separate `userdata` table for ownership. Use `profiles` instead.
- Foreign keys from app tables to `auth.users` without a compelling reason.

