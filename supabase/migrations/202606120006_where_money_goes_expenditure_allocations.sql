create table public.department_expenditure_facts (
  id uuid primary key default gen_random_uuid(),
  financial_year_id uuid not null references public.financial_years(id) on delete cascade,
  department_name text not null,
  amount numeric(18,2) not null check (amount >= 0),
  source_url text,
  created_at timestamptz not null default now(),
  unique (financial_year_id, department_name)
);

alter table public.department_expenditure_facts enable row level security;

create policy "Public can read department expenditure facts"
on public.department_expenditure_facts for select to anon, authenticated using (true);

grant select on public.department_expenditure_facts to anon, authenticated;

with current_year as (
  select id
  from public.financial_years
  where municipality_id = '54534857-414e-4000-8000-000000000001'
    and label = '2026/27'
), facts(department_name, amount) as (values
  ('Energy and Electricity', 22645520882::numeric),
  ('Roads and Transport', 1338352145::numeric),
  ('Water and Sanitation', 10558320004::numeric),
  ('Environment and Agriculture Management', 2071257919::numeric),
  ('Community and Social Development Services', 520866194::numeric),
  ('Tshwane Metro Police', 4182263524::numeric),
  ('Other municipal departments', 15267729137.20::numeric)
)
insert into public.department_expenditure_facts (
  financial_year_id, department_name, amount, source_url
)
select
  current_year.id,
  facts.department_name,
  facts.amount,
  'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'
from facts
cross join current_year
on conflict (financial_year_id, department_name) do update set
  amount = excluded.amount,
  source_url = excluded.source_url;

with current_year as (
  select id
  from public.financial_years
  where municipality_id = '54534857-414e-4000-8000-000000000001'
    and label = '2026/27'
), mapped(allocation_name, department_name, sort_order) as (values
  ('Electricity Infrastructure', 'Energy and Electricity', 1),
  ('Roads and Transport', 'Roads and Transport', 2),
  ('Water and Sanitation', 'Water and Sanitation', 3),
  ('Waste Management', 'Environment and Agriculture Management', 4),
  ('Community Services', 'Community and Social Development Services', 5),
  ('Public Safety', 'Tshwane Metro Police', 6),
  ('Administration and Other Services', 'Other municipal departments', 7)
), total as (
  select sum(def.amount) as amount
  from public.department_expenditure_facts def
  join current_year on current_year.id = def.financial_year_id
)
update public.budget_allocation_percentages allocation
set
  percentage = round((def.amount / nullif(total.amount, 0)) * 100, 2),
  source_note = 'Derived from City of Tshwane 2026/27 departmental operating expenditure in Budget 2.0.'
from mapped
join public.department_expenditure_facts def on def.department_name = mapped.department_name
join current_year on current_year.id = def.financial_year_id
cross join total
where allocation.financial_year_id = current_year.id
  and allocation.allocation_name = mapped.allocation_name;
