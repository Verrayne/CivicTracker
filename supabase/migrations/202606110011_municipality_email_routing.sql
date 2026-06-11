alter table public.routing_rules
add column municipality_id uuid references public.municipalities(id);

update public.routing_rules
set municipality_id = '54534857-414e-4000-8000-000000000001'
where municipality_id is null;

alter table public.routing_rules
alter column municipality_id set not null;

alter table public.routing_rules
drop constraint if exists routing_rules_issue_type_id_email_address_key;

alter table public.routing_rules
add constraint routing_rules_municipality_issue_type_key
unique (municipality_id, issue_type_id);

grant insert (municipality_id) on public.routing_rules to authenticated;
