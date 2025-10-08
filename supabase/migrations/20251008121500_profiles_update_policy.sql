-- Allow authenticated users to update their own profile row
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile'
  ) then
    create policy "Users can update own profile" on public.profiles for update to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

