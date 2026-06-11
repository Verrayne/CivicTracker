create function public.validate_streetlight_lamp_pole_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.issue_type_id = '10000000-0000-0000-0000-000000000002'
    and nullif(trim(new.lamp_pole_number), '') is null then
    raise exception 'Lamp pole number is required for streetlight issues';
  end if;
  return new;
end;
$$;

create trigger validate_streetlight_lamp_pole
before insert on public.issues
for each row execute function public.validate_streetlight_lamp_pole_number();

revoke execute on function public.validate_streetlight_lamp_pole_number() from public, anon, authenticated;
