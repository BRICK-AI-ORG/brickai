-- RPC to get or create an address by canonical hash
create or replace function public.get_or_create_address(
  p_line1 text,
  p_line2 text,
  p_city text,
  p_region text,
  p_postal_code text,
  p_country char(2)
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_country char(2) := upper(coalesce(p_country, 'GB'));
  v_hash text;
  v_id uuid;
begin
  v_hash := md5(
    lower(regexp_replace(coalesce(p_line1,''), '\\s+', ' ', 'g')) || '|' ||
    lower(regexp_replace(coalesce(p_line2,''), '\\s+', ' ', 'g')) || '|' ||
    lower(regexp_replace(coalesce(p_city,''), '\\s+', ' ', 'g')) || '|' ||
    lower(regexp_replace(coalesce(p_region,''), '\\s+', ' ', 'g')) || '|' ||
    upper(regexp_replace(coalesce(p_postal_code,''), '\\s+', '', 'g')) || '|' ||
    v_country
  );

  select address_id into v_id from public.addresses where address_hash = v_hash limit 1;
  if v_id is not null then return v_id; end if;

  insert into public.addresses(line1, line2, city, region, postal_code, country)
  values (p_line1, p_line2, p_city, p_region, p_postal_code, v_country)
  returning address_id into v_id;

  return v_id;
end;
$$;

grant execute on function public.get_or_create_address(text, text, text, text, text, char(2)) to authenticated;

