-- Add a status column to tasks with allowed values and sensible defaults
alter table public.tasks
  add column if not exists status text
    check (status in ('todo', 'in_progress', 'done'))
    default 'todo';

-- Backfill existing rows based on completed flag
update public.tasks
set status = case when coalesce(completed, false) then 'done' else 'todo' end
where status is null;

-- Enforce not-null after backfill
alter table public.tasks
  alter column status set not null;

-- Optional index to help simple filters
create index if not exists idx_tasks_status on public.tasks(status);
