insert into public.wards (id, name, councillor_name, councillor_email)
values ('47474747-4747-4747-4747-474747474747', 'Ward 47', null, null)
on conflict (name) do nothing;

insert into public.issue_types (id, name) values
  ('10000000-0000-0000-0000-000000000001', 'Pothole'),
  ('10000000-0000-0000-0000-000000000002', 'Streetlight'),
  ('10000000-0000-0000-0000-000000000003', 'Water Leak'),
  ('10000000-0000-0000-0000-000000000004', 'Illegal Dumping'),
  ('10000000-0000-0000-0000-000000000005', 'Traffic Signal'),
  ('10000000-0000-0000-0000-000000000006', 'Stormwater Drain'),
  ('10000000-0000-0000-0000-000000000007', 'Road Sign Damage'),
  ('10000000-0000-0000-0000-000000000008', 'Other')
on conflict (name) do nothing;

insert into public.routing_rules (issue_type_id, email_address) values
  ('10000000-0000-0000-0000-000000000001', 'pothole@tshwane.gov.za'),
  ('10000000-0000-0000-0000-000000000002', 'streetlights@tshwane.gov.za'),
  ('10000000-0000-0000-0000-000000000003', 'waterleaks@tshwane.gov.za'),
  ('10000000-0000-0000-0000-000000000005', 'trafficsignalfaults@tshwane.gov.za'),
  ('10000000-0000-0000-0000-000000000008', 'customercare@tshwane.gov.za')
on conflict (issue_type_id, email_address) do nothing;

insert into public.routing_rules (issue_type_id, email_address)
select id, 'customercare@tshwane.gov.za'
from public.issue_types
where name in ('Illegal Dumping', 'Stormwater Drain', 'Road Sign Damage')
on conflict (issue_type_id, email_address) do nothing;
