alter table public.issues
add column lamp_pole_number text;

grant select (lamp_pole_number) on public.issues to anon, authenticated;
grant insert (lamp_pole_number) on public.issues to anon, authenticated;

create policy "Admins can read routing rules"
on public.routing_rules
for select
to authenticated
using (public.is_admin());

create policy "Admins can create routing rules"
on public.routing_rules
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update routing rules"
on public.routing_rules
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.routing_rules to authenticated;
grant insert (issue_type_id, email_address, active) on public.routing_rules to authenticated;
grant update (email_address, active) on public.routing_rules to authenticated;
