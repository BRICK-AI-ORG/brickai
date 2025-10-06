-- Harden storage cleanup to prevent cross-tenant deletions
-- and enforce image_url ownership via RLS policies.

-- 1) Restrict trigger-driven deletion to the owning user's folder.
-- Previously, the trigger deleted by exact name only, which could allow a user
-- to set image_url to another user's path and cause deletion on task delete.
-- We additionally require the prefix folder to match the task owner.
create or replace function delete_task_storage_object()
returns trigger
security definer
set search_path = public
as $$
begin
  -- Only attempt to delete if there was an image
  if old.image_url is not null then
    -- Delete directly from storage.objects table, but only when the object
    -- is within the owner's folder (first path segment equals old.user_id).
    delete from storage.objects
    where bucket_id = 'task-attachments'
      and name = old.image_url
      and split_part(name, '/', 1) = old.user_id::text;
  end if;

  return old;
end;
$$ language plpgsql;

-- 2) Add explicit RLS policies to ensure image_url stays under the owner's namespace
--    both on INSERT and UPDATE operations. This prevents users from setting image_url
--    to other users' folders even before deletion.

-- Allow INSERT of own tasks and constrain image_url to own folder when provided
create policy "Users insert own tasks with owned image path"
  on public.tasks
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      image_url is null
      or split_part(image_url, '/', 1) = auth.uid()::text
    )
  );

-- Allow UPDATE of own tasks and constrain image_url to own folder when provided
create policy "Users update own tasks with owned image path"
  on public.tasks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      image_url is null
      or split_part(image_url, '/', 1) = auth.uid()::text
    )
  );


