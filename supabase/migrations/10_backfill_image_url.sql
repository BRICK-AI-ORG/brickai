-- Backfill tasks.image_url to ensure owner-prefixed path: "<user_id>/<basename>"
-- Note: This migration only updates DB references. If existing objects live
-- under non-prefixed paths or wrong prefixes, they should be moved in storage
-- to keep links valid. See repository notes for a one-time script approach.

-- Normalize image_url to ensure it starts with the owning user_id
update public.tasks t
set image_url = t.user_id::text || '/' ||
  case
    when position('/' in t.image_url) > 0 then regexp_replace(t.image_url, '^[^/]*/', '')
    else t.image_url
  end
where t.image_url is not null
  and split_part(t.image_url, '/', 1) <> t.user_id::text;

