-- Make task-attachments bucket private and replace public read with owner-only read.

-- Ensure RLS is enabled on storage.objects (it usually is by default)
do $$
declare
  rls_enabled boolean := null;
begin
  select c.relrowsecurity
  into rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'storage' and c.relname = 'objects';

  if coalesce(rls_enabled, false) = false then
    begin
      alter table storage.objects enable row level security;
    exception
      when insufficient_privilege then
        raise notice 'insufficient privilege to enable RLS on storage.objects; skipping';
      when others then
        raise notice 'skipping RLS enable due to: %', SQLERRM;
    end;
  end if;
end $$;

-- Make the bucket private
do $$
begin
  update storage.buckets
  set public = false
  where id = 'task-attachments';
exception
  when insufficient_privilege then
    raise notice 'insufficient privilege to update storage.buckets; skipping';
  when others then
    raise notice 'skipping bucket privacy update due to: %', SQLERRM;
end $$;

-- Drop public read policy if it exists
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view attachments'
  ) then
    begin
      drop policy "Public can view attachments" on storage.objects;
    exception
      when insufficient_privilege then
        raise notice 'insufficient privilege to drop policy on storage.objects; skipping';
      when others then
        raise notice 'skipping drop policy due to: %', SQLERRM;
    end;
  end if;
end $$;

-- Add owner-only read policy
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can read their own attachments'
  ) then
    begin
      create policy "Users can read their own attachments"
      on storage.objects for select
      to authenticated
      using (
        bucket_id = 'task-attachments'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
    exception
      when insufficient_privilege then
        raise notice 'insufficient privilege to create policy on storage.objects; skipping';
      when others then
        raise notice 'skipping create policy due to: %', SQLERRM;
    end;
  end if;
end $$;
