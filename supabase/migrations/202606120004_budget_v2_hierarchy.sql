alter table public.revenue_facts
add column if not exists growth_percentage numeric(10,2);

alter table public.expenditure_categories
add column if not exists parent_id uuid references public.expenditure_categories(id) on delete cascade;

alter table public.expenditure_facts
add column if not exists growth_percentage numeric(10,2);

insert into public.revenue_categories (municipality_id, name, sort_order) values
  ('54534857-414e-4000-8000-000000000001', 'Revenue', -10),
  ('54534857-414e-4000-8000-000000000001', 'Service Charges', -9),
  ('54534857-414e-4000-8000-000000000001', 'Sale of Goods and Rendering of Services', 10),
  ('54534857-414e-4000-8000-000000000001', 'Interest Earned from Current and Non Current Assets', 12),
  ('54534857-414e-4000-8000-000000000001', 'Rent on Land', 13),
  ('54534857-414e-4000-8000-000000000001', 'Rental from Fixed Assets', 14),
  ('54534857-414e-4000-8000-000000000001', 'Licences and Permits', 15),
  ('54534857-414e-4000-8000-000000000001', 'Development Charges', 16),
  ('54534857-414e-4000-8000-000000000001', 'Operational Revenue', 17),
  ('54534857-414e-4000-8000-000000000001', 'Non Exchange Revenue', -7),
  ('54534857-414e-4000-8000-000000000001', 'Fines Penalties and Forfeits', 19)
on conflict (municipality_id, name) do update set sort_order = excluded.sort_order;

delete from public.revenue_facts
where category_id = (
  select id from public.revenue_categories
  where municipality_id = '54534857-414e-4000-8000-000000000001' and name = 'Other Revenue'
);

update public.revenue_categories
set name = 'Interest Earned from Receivables'
where municipality_id = '54534857-414e-4000-8000-000000000001' and name = 'Interest on Receivables';

update public.revenue_categories
set name = 'Transfers Recognised Operational'
where municipality_id = '54534857-414e-4000-8000-000000000001' and name = 'Operational Grants';

update public.revenue_categories child
set parent_id = parent.id
from public.revenue_categories parent
where child.municipality_id = '54534857-414e-4000-8000-000000000001'
  and parent.municipality_id = child.municipality_id
  and parent.name = 'Revenue'
  and child.name in ('Service Charges', 'Other Revenue', 'Non Exchange Revenue');

update public.revenue_categories child
set parent_id = parent.id
from public.revenue_categories parent
where child.municipality_id = '54534857-414e-4000-8000-000000000001'
  and parent.municipality_id = child.municipality_id
  and parent.name = 'Service Charges'
  and child.name in ('Electricity', 'Water', 'Waste Water Management', 'Waste Management');

update public.revenue_categories child
set parent_id = parent.id
from public.revenue_categories parent
where child.municipality_id = '54534857-414e-4000-8000-000000000001'
  and parent.municipality_id = child.municipality_id
  and parent.name = 'Other Revenue'
  and child.name in (
    'Sale of Goods and Rendering of Services',
    'Interest Earned from Receivables',
    'Interest Earned from Current and Non Current Assets',
    'Rent on Land',
    'Rental from Fixed Assets',
    'Licences and Permits',
    'Development Charges',
    'Operational Revenue'
  );

update public.revenue_categories child
set parent_id = parent.id
from public.revenue_categories parent
where child.municipality_id = '54534857-414e-4000-8000-000000000001'
  and parent.municipality_id = child.municipality_id
  and parent.name = 'Non Exchange Revenue'
  and child.name in (
    'Property Rates',
    'Fines Penalties and Forfeits',
    'Transfers Recognised Operational',
    'Fuel Levy'
  );

with source as (
  select 'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'::text as url
), facts(year_label, scenario, category, amount) as (values
  ('2025/26','Adjustment Budget','Sale of Goods and Rendering of Services',557328726.23), ('2026/27','Budget','Sale of Goods and Rendering of Services',577949889.09), ('2027/28','Estimate','Sale of Goods and Rendering of Services',597022235.45), ('2028/29','Estimate','Sale of Goods and Rendering of Services',616126947),
  ('2025/26','Adjustment Budget','Interest Earned from Current and Non Current Assets',152964888.22), ('2026/27','Budget','Interest Earned from Current and Non Current Assets',154494537.10), ('2027/28','Estimate','Interest Earned from Current and Non Current Assets',156039482.47), ('2028/29','Estimate','Interest Earned from Current and Non Current Assets',157599877.30),
  ('2025/26','Adjustment Budget','Rent on Land',48961813), ('2026/27','Budget','Rent on Land',53412887), ('2027/28','Estimate','Rent on Land',53412887), ('2028/29','Estimate','Rent on Land',55122099.38),
  ('2025/26','Adjustment Budget','Rental from Fixed Assets',162889103.61), ('2026/27','Budget','Rental from Fixed Assets',175326258.93), ('2027/28','Estimate','Rental from Fixed Assets',181112025.48), ('2028/29','Estimate','Rental from Fixed Assets',186907610.32),
  ('2025/26','Adjustment Budget','Licences and Permits',42227278.57), ('2026/27','Budget','Licences and Permits',43789687.88), ('2027/28','Estimate','Licences and Permits',45234747.57), ('2028/29','Estimate','Licences and Permits',46682259.48),
  ('2025/26','Adjustment Budget','Development Charges',0), ('2026/27','Budget','Development Charges',224570127.19), ('2027/28','Estimate','Development Charges',214259694.67), ('2028/29','Estimate','Development Charges',219403586.60),
  ('2025/26','Adjustment Budget','Operational Revenue',649695007.47), ('2026/27','Budget','Operational Revenue',449163595.56), ('2027/28','Estimate','Operational Revenue',463985994.21), ('2028/29','Estimate','Operational Revenue',478833546.02),
  ('2025/26','Adjustment Budget','Fines Penalties and Forfeits',289102743.72), ('2026/27','Budget','Fines Penalties and Forfeits',299799545.23), ('2027/28','Estimate','Fines Penalties and Forfeits',309692930.22), ('2028/29','Estimate','Fines Penalties and Forfeits',319603103.98)
)
insert into public.revenue_facts (financial_year_id, category_id, scenario, amount, source_url)
select fy.id, rc.id, facts.scenario, facts.amount, source.url
from facts
join public.financial_years fy on fy.label = facts.year_label and fy.municipality_id = '54534857-414e-4000-8000-000000000001'
join public.revenue_categories rc on rc.name = facts.category and rc.municipality_id = fy.municipality_id
cross join source
on conflict (financial_year_id, category_id, scenario) do update set amount = excluded.amount, source_url = excluded.source_url;

with ordered as (
  select
    rf.id,
    rf.amount,
    lag(rf.amount) over (partition by rf.category_id order by fy.sort_order) as previous_amount
  from public.revenue_facts rf
  join public.financial_years fy on fy.id = rf.financial_year_id
  where fy.municipality_id = '54534857-414e-4000-8000-000000000001'
)
update public.revenue_facts facts
set growth_percentage = case
  when ordered.previous_amount is null or ordered.previous_amount = 0 then null
  else round(((ordered.amount - ordered.previous_amount) / ordered.previous_amount) * 100, 2)
end
from ordered
where facts.id = ordered.id;

with ordered as (
  select
    ef.id,
    ef.amount,
    lag(ef.amount) over (partition by ef.category_id order by fy.sort_order) as previous_amount
  from public.expenditure_facts ef
  join public.financial_years fy on fy.id = ef.financial_year_id
  where fy.municipality_id = '54534857-414e-4000-8000-000000000001'
)
update public.expenditure_facts facts
set growth_percentage = case
  when ordered.previous_amount is null or ordered.previous_amount = 0 then null
  else round(((ordered.amount - ordered.previous_amount) / ordered.previous_amount) * 100, 2)
end
from ordered
where facts.id = ordered.id;

insert into public.departments (municipality_id, name) values
  ('54534857-414e-4000-8000-000000000001', 'Tshwane Economic Development Agency'),
  ('54534857-414e-4000-8000-000000000001', 'Group Human Capital Management'),
  ('54534857-414e-4000-8000-000000000001', 'Group Legal and Secretariat Services'),
  ('54534857-414e-4000-8000-000000000001', 'Group Property'),
  ('54534857-414e-4000-8000-000000000001', 'Office of the Speaker')
on conflict (municipality_id, name) do nothing;

with source as (
  select 'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'::text as url
), budgets(year_label, amount) as (values
  ('2026/27',756321), ('2027/28',756321), ('2028/29',623967)
)
insert into public.department_budgets (department_id, financial_year_id, amount, source_url)
select d.id, fy.id, budgets.amount, source.url
from budgets
join public.departments d on d.name = 'Tshwane Economic Development Agency' and d.municipality_id = '54534857-414e-4000-8000-000000000001'
join public.financial_years fy on fy.label = budgets.year_label and fy.municipality_id = d.municipality_id
cross join source
on conflict (department_id, financial_year_id) do update set amount = excluded.amount, source_url = excluded.source_url;
