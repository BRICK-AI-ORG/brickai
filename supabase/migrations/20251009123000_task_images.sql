-- Multiple images per task
create table if not exists public.task_images (
  image_id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(task_id) on delete cascade,
  path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_task_images_task_id on public.task_images(task_id);

alter table public.task_images enable row level security;

-- Policies: CRUD allowed for owner of the parent task
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='task_images' and policyname='task_images_owner_select'
  ) then
    create policy "task_images_owner_select" on public.task_images for select to authenticated
      using (exists (select 1 from public.tasks t where t.task_id = task_id and t.user_id = auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='task_images' and policyname='task_images_owner_insert'
  ) then
    create policy "task_images_owner_insert" on public.task_images for insert to authenticated
      with check (exists (select 1 from public.tasks t where t.task_id = task_id and t.user_id = auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='task_images' and policyname='task_images_owner_update'
  ) then
    create policy "task_images_owner_update" on public.task_images for update to authenticated
      using (exists (select 1 from public.tasks t where t.task_id = task_id and t.user_id = auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='task_images' and policyname='task_images_owner_delete'
  ) then
    create policy "task_images_owner_delete" on public.task_images for delete to authenticated
      using (exists (select 1 from public.tasks t where t.task_id = task_id and t.user_id = auth.uid()));
  end if;
end $$;

-- Enforce max 5 images per task at DB level
create or replace function public.enforce_max_task_images()
returns trigger
security definer
set search_path = public
as $$
declare
  cnt int;
begin
  select count(*) into cnt from public.task_images where task_id = NEW.task_id;
  if cnt >= 5 then
    raise exception 'Maximum of 5 images per task exceeded';
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_enforce_max_task_images on public.task_images;
create trigger trg_enforce_max_task_images
  before insert on public.task_images
  for each row execute function public.enforce_max_task_images();
