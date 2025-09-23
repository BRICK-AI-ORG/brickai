-- Make task-attachments bucket private and replace public read with owner-only read.

-- Ensure RLS is enabled on storage.objects (it usually is by default)
alter table if exists storage.objects enable row level security;

-- Make the bucket private
update storage.buckets
set public = false
where id = 'task-attachments';

-- Drop public read policy if it exists
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view attachments'
  ) then
    drop policy "Public can view attachments" on storage.objects;
  end if;
end $$;

-- Add owner-only read policy
create policy if not exists "Users can read their own attachments"
on storage.objects for select
to authenticated
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

