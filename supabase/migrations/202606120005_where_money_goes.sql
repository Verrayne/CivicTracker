create table public.budget_allocation_percentages (
  id uuid primary key default gen_random_uuid(),
  financial_year_id uuid not null references public.financial_years(id) on delete cascade,
  allocation_name text not null,
  percentage numeric(5,2) not null check (percentage >= 0 and percentage <= 100),
  sort_order integer not null default 0,
  source_note text,
  created_at timestamptz not null default now(),
  unique (financial_year_id, allocation_name)
);

create table public.municipal_rates_parameters (
  id uuid primary key default gen_random_uuid(),
  financial_year_id uuid not null references public.financial_years(id) on delete cascade,
  property_type text not null,
  tariff_cents_per_rand numeric(10,4) not null check (tariff_cents_per_rand >= 0),
  valuation_reduction numeric(18,2) not null default 0 check (valuation_reduction >= 0),
  source_url text,
  created_at timestamptz not null default now(),
  unique (financial_year_id, property_type)
);

create table public.municipal_impact_estimates (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  insight_name text not null,
  unit_label text not null,
  estimated_cost_per_unit numeric(18,2) not null check (estimated_cost_per_unit > 0),
  icon_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (municipality_id, insight_name)
);

alter table public.budget_allocation_percentages enable row level security;
alter table public.municipal_rates_parameters enable row level security;
alter table public.municipal_impact_estimates enable row level security;

create policy "Public can read budget allocation percentages"
on public.budget_allocation_percentages for select to anon, authenticated using (true);

create policy "Public can read municipal rates parameters"
on public.municipal_rates_parameters for select to anon, authenticated using (true);

create policy "Public can read municipal impact estimates"
on public.municipal_impact_estimates for select to anon, authenticated using (true);

grant select on
  public.budget_allocation_percentages,
  public.municipal_rates_parameters,
  public.municipal_impact_estimates
to anon, authenticated;

with current_year as (
  select id
  from public.financial_years
  where municipality_id = '54534857-414e-4000-8000-000000000001'
    and label = '2026/27'
), department_amounts as (
  select d.name, db.amount
  from public.department_budgets db
  join public.departments d on d.id = db.department_id
  join current_year fy on fy.id = db.financial_year_id
), grouped(allocation_name, amount, sort_order) as (
  select 'Electricity Infrastructure', coalesce(sum(amount), 0), 1 from department_amounts where name = 'Energy and Electricity'
  union all
  select 'Roads and Transport', coalesce(sum(amount), 0), 2 from department_amounts where name = 'Roads and Transport'
  union all
  select 'Water and Sanitation', coalesce(sum(amount), 0), 3 from department_amounts where name = 'Water and Sanitation'
  union all
  select 'Waste Management', coalesce(sum(amount), 0), 4 from department_amounts where name = 'Environment and Agriculture'
  union all
  select 'Community Services', coalesce(sum(amount), 0), 5 from department_amounts where name in ('Community and Social Development', 'Health', 'Emergency Services')
  union all
  select 'Public Safety', coalesce(sum(amount), 0), 6 from department_amounts where name = 'Tshwane Metro Police'
  union all
  select 'Administration and Other Services', coalesce(sum(amount), 0), 7
  from department_amounts
  where name not in (
    'Energy and Electricity',
    'Roads and Transport',
    'Water and Sanitation',
    'Environment and Agriculture',
    'Community and Social Development',
    'Health',
    'Emergency Services',
    'Tshwane Metro Police'
  )
), total as (
  select sum(amount) as amount from grouped
)
insert into public.budget_allocation_percentages (
  financial_year_id, allocation_name, percentage, sort_order, source_note
)
select
  current_year.id,
  grouped.allocation_name,
  round((grouped.amount / nullif(total.amount, 0)) * 100, 2),
  grouped.sort_order,
  'Derived from City of Tshwane 2026/27 departmental capital budget allocations in Budget 2.0.'
from grouped
cross join total
cross join current_year
on conflict (financial_year_id, allocation_name) do update set
  percentage = excluded.percentage,
  sort_order = excluded.sort_order,
  source_note = excluded.source_note;

insert into public.municipal_rates_parameters (
  financial_year_id, property_type, tariff_cents_per_rand, valuation_reduction, source_url
)
select
  id,
  'Residential',
  1.231,
  250000,
  'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'
from public.financial_years
where municipality_id = '54534857-414e-4000-8000-000000000001'
  and label = '2026/27'
on conflict (financial_year_id, property_type) do update set
  tariff_cents_per_rand = excluded.tariff_cents_per_rand,
  valuation_reduction = excluded.valuation_reduction,
  source_url = excluded.source_url;

insert into public.municipal_impact_estimates (
  municipality_id, insight_name, unit_label, estimated_cost_per_unit, icon_name, sort_order
) values
  ('54534857-414e-4000-8000-000000000001', 'Road maintenance', 'metres of road maintenance', 2500, 'road', 1),
  ('54534857-414e-4000-8000-000000000001', 'Streetlight maintenance', 'streetlight maintenance visits', 3750, 'lightbulb', 2),
  ('54534857-414e-4000-8000-000000000001', 'Refuse collection', 'refuse collection months', 7500, 'trash', 3),
  ('54534857-414e-4000-8000-000000000001', 'Water infrastructure', 'water infrastructure inspections', 15000, 'droplets', 4)
on conflict (municipality_id, insight_name) do update set
  unit_label = excluded.unit_label,
  estimated_cost_per_unit = excluded.estimated_cost_per_unit,
  icon_name = excluded.icon_name,
  sort_order = excluded.sort_order;
