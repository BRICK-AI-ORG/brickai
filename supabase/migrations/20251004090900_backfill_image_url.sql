-- Backfill tasks.image_url to ensure owner-prefixed path: "<user_id>/<basename>"
-- Note: This migration only updates DB references. If existing objects live
-- under non-prefixed paths or wrong prefixes, they should be moved in storage
-- to keep links valid. See repository notes for a one-time script approach.

do $$
begin
  -- Only run if public.tasks with image_url exists
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'tasks'
      and column_name  = 'image_url'
  ) then
    -- Normalize image_url to ensure it starts with the owning user_id
    update public.tasks t
    set image_url = t.user_id::text || '/' ||
      case
        when position('/' in t.image_url) > 0 then regexp_replace(t.image_url, '^[^/]*/', '')
        else t.image_url
      end
    where t.image_url is not null
      and split_part(t.image_url, '/', 1) <> t.user_id::text;
  else
    raise notice 'Skipping backfill: tasks.image_url not found';
  end if;
end $$;

