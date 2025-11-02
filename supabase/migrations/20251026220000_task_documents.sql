-- Task documents storage schema and policies

-- Create table to track task documents
create table if not exists public.task_documents (
  document_id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(task_id) on delete cascade,
  path text not null,
  file_name text not null,
  file_size bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_task_documents_task_id on public.task_documents(task_id);

alter table public.task_documents enable row level security;

-- RLS policies to scope access to owning task user
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'task_documents'
      and policyname = 'task_documents_owner_select'
  ) then
    create policy task_documents_owner_select
      on public.task_documents
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.tasks t
          where t.task_id = task_id
            and t.user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'task_documents'
      and policyname = 'task_documents_owner_insert'
  ) then
    create policy task_documents_owner_insert
      on public.task_documents
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.tasks t
          where t.task_id = task_id
            and t.user_id = auth.uid()
            and split_part(path, '/', 1) = auth.uid()::text
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'task_documents'
      and policyname = 'task_documents_owner_update'
  ) then
    create policy task_documents_owner_update
      on public.task_documents
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.tasks t
          where t.task_id = task_id
            and t.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.tasks t
          where t.task_id = task_id
            and t.user_id = auth.uid()
            and split_part(path, '/', 1) = auth.uid()::text
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'task_documents'
      and policyname = 'task_documents_owner_delete'
  ) then
    create policy task_documents_owner_delete
      on public.task_documents
      for delete
      to authenticated
      using (
        exists (
          select 1
          from public.tasks t
          where t.task_id = task_id
            and t.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Enforce a maximum of 3 documents per task
create or replace function public.enforce_max_task_documents()
returns trigger
security definer
set search_path = public
as $$
declare
  cnt int;
begin
  select count(*) into cnt
  from public.task_documents
  where task_id = new.task_id;

  if cnt >= 3 then
    raise exception 'Maximum of 3 documents per task exceeded';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_enforce_max_task_documents on public.task_documents;
create trigger trg_enforce_max_task_documents
  before insert on public.task_documents
  for each row execute function public.enforce_max_task_documents();

-- Ensure storage bucket exists and is private
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'task-documents'
  ) then
    insert into storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types
    )
    values (
      'task-documents',
      'task-documents',
      false,
      5 * 1024 * 1024, -- 5MB
      array['application/pdf']
    );
  else
    update storage.buckets
    set public = false,
        file_size_limit = 5 * 1024 * 1024,
        allowed_mime_types = array['application/pdf']
    where id = 'task-documents';
  end if;
exception
  when undefined_table then
    null;
end $$;

-- Storage policies for task documents bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'task_documents_owner_select'
  ) then
    create policy task_documents_owner_select
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'task-documents'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'task_documents_owner_insert'
  ) then
    create policy task_documents_owner_insert
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'task-documents'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'task_documents_owner_delete'
  ) then
    create policy task_documents_owner_delete
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'task-documents'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- Trigger to clean up storage objects when rows are deleted (including cascade)
create or replace function public.delete_task_document_object()
returns trigger
security definer
set search_path = public
as $$
declare
  owner uuid;
begin
  select user_id into owner
  from public.tasks
  where task_id = old.task_id;

  if owner is not null and old.path is not null then
    delete from storage.objects
    where bucket_id = 'task-documents'
      and name = old.path
      and split_part(name, '/', 1) = owner::text;
  end if;

  return old;
end;
$$ language plpgsql;

drop trigger if exists trg_delete_task_document_object on public.task_documents;
create trigger trg_delete_task_document_object
  before delete on public.task_documents
  for each row execute function public.delete_task_document_object();
