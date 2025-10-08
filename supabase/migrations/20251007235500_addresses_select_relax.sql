-- Allow authenticated users to select addresses so INSERT ... RETURNING works during onboarding
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='Addresses readable to authenticated'
  ) then
    create policy "Addresses readable to authenticated"
      on public.addresses
      for select
      to authenticated
      using (true);
  end if;
end$$;

