-- Allow ""lowest"" as a valid priority value
alter table public.tasks
  drop constraint if exists tasks_priority_check;

alter table public.tasks
  add constraint tasks_priority_check
  check (priority in ('low','medium','high','urgent','lowest'));
