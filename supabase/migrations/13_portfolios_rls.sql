-- Enable RLS and add ownership policy for portfolios
alter table public.portfolios enable row level security;

create policy if not exists "Portfolios accessible by owner"
on public.portfolios for all
using (auth.uid() = user_id);

