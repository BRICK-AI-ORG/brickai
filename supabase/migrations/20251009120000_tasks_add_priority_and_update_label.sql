-- Add a priority column to tasks and update label constraint to property-centric set (keep legacy)
alter table public.tasks
  add column if not exists priority text
    check (priority in ('low','medium','high','urgent'))
    default 'medium';

-- Backfill null priorities to default
update public.tasks
set priority = coalesce(priority, 'medium')
where priority is null;

-- Make priority not null after backfill
alter table public.tasks
  alter column priority set not null;

-- Relax and redefine label check constraint to match app labels (including legacy)
do $$
begin
  -- Drop existing unnamed label check if it exists
  begin
    alter table public.tasks drop constraint if exists tasks_label_check;
  exception when others then
    -- ignore
    null;
  end;
end $$;

alter table public.tasks
  add constraint tasks_label_check
  check (
    label is null or label in (
      'maintenance','compliance','finance','admin','lettings','inspection','refurb','legal','operations','tenant',
      -- legacy values kept for existing rows/compatibility
      'work','personal','shopping','home','priority'
    )
  );

-- Helpful composite index for due_date-first queries
create index if not exists idx_tasks_due_date_priority on public.tasks(due_date asc, priority asc);

