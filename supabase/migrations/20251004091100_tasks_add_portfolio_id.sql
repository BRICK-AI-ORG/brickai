-- Add portfolio_id to tasks and link to portfolios
alter table public.tasks
  add column if not exists portfolio_id uuid references public.portfolios(portfolio_id) on delete set null;

create index if not exists idx_tasks_portfolio_id on public.tasks(portfolio_id);


