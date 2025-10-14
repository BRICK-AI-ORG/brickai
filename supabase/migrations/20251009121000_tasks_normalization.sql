-- Enforce stronger normalization and consistency on tasks and portfolios

-- 1) Ensure tasks.user_id is set; backfill from portfolios if needed
update public.tasks t
set user_id = p.user_id
from public.portfolios p
where t.portfolio_id = p.portfolio_id
  and t.user_id is null;

-- 2) Make tasks.user_id not null
alter table public.tasks
  alter column user_id set not null;

-- 3) Ensure tasks.completed is not null (backfill false)
update public.tasks set completed = coalesce(completed, false) where completed is null;
alter table public.tasks
  alter column completed set not null;

-- 4) Ensure tasks.status is not null (already backfilled in prior migration)
--    Keep here to assert the constraint if previous migration was skipped.
update public.tasks set status = case when coalesce(completed,false) then 'done' else coalesce(status,'todo') end
where status is null;
alter table public.tasks
  alter column status set not null;

-- 5) Enforce ownership consistency with a trigger instead of composite FK
--    so deleting a portfolio can still nullify portfolio_id without touching user_id.
create or replace function public.assert_task_portfolio_ownership()
returns trigger
security definer
set search_path = public
as $$
declare
  p_owner uuid;
begin
  if NEW.portfolio_id is not null then
    select user_id into p_owner from public.portfolios where portfolio_id = NEW.portfolio_id;
    if not found then
      raise exception 'Portfolio % not found', NEW.portfolio_id;
    end if;
    if NEW.user_id is null or NEW.user_id <> p_owner then
      raise exception 'Task user_id must match portfolio owner for portfolio %', NEW.portfolio_id;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_assert_task_portfolio_ownership on public.tasks;
create trigger trg_assert_task_portfolio_ownership
  before insert or update on public.tasks
  for each row execute function public.assert_task_portfolio_ownership();

-- 7) Normalize completed/status consistency via trigger
create or replace function public.normalize_task_status()
returns trigger
security definer
set search_path = public
as $$
begin
  -- Normalize status if missing
  if NEW.status is null then
    NEW.status := case when coalesce(NEW.completed,false) then 'done' else 'todo' end;
  end if;

  -- Ensure completed reflects status
  NEW.completed := (NEW.status = 'done');

  -- Guard against invalid status values (defense-in-depth; check constraint also exists)
  if NEW.status not in ('todo','in_progress','done') then
    raise exception 'Invalid status %', NEW.status;
  end if;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_normalize_task_status on public.tasks;
create trigger trg_normalize_task_status
  before insert or update on public.tasks
  for each row execute function public.normalize_task_status();

-- 8) Ownership check is enforced via the assertion trigger above.
