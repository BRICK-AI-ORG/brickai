-- Enable RLS and add ownership policy for portfolios
alter table public.portfolios enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'portfolios'
      and policyname = 'Portfolios accessible by owner'
  ) then
    create policy "Portfolios accessible by owner"
      on public.portfolios
      for all
      using (auth.uid() = user_id);
  end if;
end$$;

