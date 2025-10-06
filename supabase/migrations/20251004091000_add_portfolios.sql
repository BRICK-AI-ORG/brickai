-- Portfolios table
create table if not exists public.portfolios (
  portfolio_id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  name varchar not null check (name <> ''),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_portfolios_user_id on public.portfolios(user_id);

