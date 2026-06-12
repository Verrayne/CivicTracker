create table public.financial_years (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  label text not null,
  start_date date not null,
  end_date date not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (municipality_id, label),
  check (end_date > start_date)
);

create table public.revenue_categories (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  parent_id uuid references public.revenue_categories(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (municipality_id, name)
);

create table public.revenue_facts (
  id uuid primary key default gen_random_uuid(),
  financial_year_id uuid not null references public.financial_years(id) on delete cascade,
  category_id uuid not null references public.revenue_categories(id) on delete cascade,
  scenario text not null check (scenario in ('Adjustment Budget', 'Budget', 'Estimate')),
  amount numeric(18,2) not null check (amount >= 0),
  source_url text,
  created_at timestamptz not null default now(),
  unique (financial_year_id, category_id, scenario)
);

create table public.expenditure_categories (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (municipality_id, name)
);

create table public.expenditure_facts (
  id uuid primary key default gen_random_uuid(),
  financial_year_id uuid not null references public.financial_years(id) on delete cascade,
  category_id uuid not null references public.expenditure_categories(id) on delete cascade,
  scenario text not null check (scenario in ('Adjustment Budget', 'Budget', 'Estimate')),
  amount numeric(18,2) not null check (amount >= 0),
  source_url text,
  created_at timestamptz not null default now(),
  unique (financial_year_id, category_id, scenario)
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (municipality_id, name)
);

create table public.department_budgets (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  financial_year_id uuid not null references public.financial_years(id) on delete cascade,
  amount numeric(18,2) not null check (amount >= 0),
  source_url text,
  created_at timestamptz not null default now(),
  unique (department_id, financial_year_id)
);

create table public.capital_projects (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  financial_year_id uuid not null references public.financial_years(id) on delete cascade,
  name text not null,
  description text,
  location text,
  budget_amount numeric(18,2) not null check (budget_amount >= 0),
  status text not null default 'Budgeted',
  source_url text,
  created_at timestamptz not null default now(),
  unique (municipality_id, financial_year_id, name)
);

create table public.capital_funding_sources (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (municipality_id, name)
);

create table public.capital_funding_facts (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.capital_funding_sources(id) on delete cascade,
  financial_year_id uuid not null references public.financial_years(id) on delete cascade,
  amount numeric(18,2) not null check (amount >= 0),
  source_url text,
  created_at timestamptz not null default now(),
  unique (source_id, financial_year_id)
);

create index revenue_facts_year_idx on public.revenue_facts (financial_year_id);
create index expenditure_facts_year_idx on public.expenditure_facts (financial_year_id);
create index department_budgets_year_idx on public.department_budgets (financial_year_id);
create index capital_projects_year_idx on public.capital_projects (financial_year_id, budget_amount desc);
create index capital_funding_facts_year_idx on public.capital_funding_facts (financial_year_id);

alter table public.financial_years enable row level security;
alter table public.revenue_categories enable row level security;
alter table public.revenue_facts enable row level security;
alter table public.expenditure_categories enable row level security;
alter table public.expenditure_facts enable row level security;
alter table public.departments enable row level security;
alter table public.department_budgets enable row level security;
alter table public.capital_projects enable row level security;
alter table public.capital_funding_sources enable row level security;
alter table public.capital_funding_facts enable row level security;

create policy "Public can read financial years" on public.financial_years for select to anon, authenticated using (true);
create policy "Public can read revenue categories" on public.revenue_categories for select to anon, authenticated using (true);
create policy "Public can read revenue facts" on public.revenue_facts for select to anon, authenticated using (true);
create policy "Public can read expenditure categories" on public.expenditure_categories for select to anon, authenticated using (true);
create policy "Public can read expenditure facts" on public.expenditure_facts for select to anon, authenticated using (true);
create policy "Public can read budget departments" on public.departments for select to anon, authenticated using (true);
create policy "Public can read department budgets" on public.department_budgets for select to anon, authenticated using (true);
create policy "Public can read capital projects" on public.capital_projects for select to anon, authenticated using (true);
create policy "Public can read capital funding sources" on public.capital_funding_sources for select to anon, authenticated using (true);
create policy "Public can read capital funding facts" on public.capital_funding_facts for select to anon, authenticated using (true);

grant select on
  public.financial_years,
  public.revenue_categories,
  public.revenue_facts,
  public.expenditure_categories,
  public.expenditure_facts,
  public.departments,
  public.department_budgets,
  public.capital_projects,
  public.capital_funding_sources,
  public.capital_funding_facts
to anon, authenticated;

insert into public.financial_years (municipality_id, label, start_date, end_date, sort_order) values
  ('54534857-414e-4000-8000-000000000001', '2025/26', '2025-07-01', '2026-06-30', 1),
  ('54534857-414e-4000-8000-000000000001', '2026/27', '2026-07-01', '2027-06-30', 2),
  ('54534857-414e-4000-8000-000000000001', '2027/28', '2027-07-01', '2028-06-30', 3),
  ('54534857-414e-4000-8000-000000000001', '2028/29', '2028-07-01', '2029-06-30', 4)
on conflict (municipality_id, label) do update set
  start_date = excluded.start_date, end_date = excluded.end_date, sort_order = excluded.sort_order;

insert into public.revenue_categories (municipality_id, name, sort_order) values
  ('54534857-414e-4000-8000-000000000001', 'Total Revenue', 0),
  ('54534857-414e-4000-8000-000000000001', 'Electricity', 1),
  ('54534857-414e-4000-8000-000000000001', 'Water', 2),
  ('54534857-414e-4000-8000-000000000001', 'Waste Water Management', 3),
  ('54534857-414e-4000-8000-000000000001', 'Waste Management', 4),
  ('54534857-414e-4000-8000-000000000001', 'Property Rates', 5),
  ('54534857-414e-4000-8000-000000000001', 'Operational Grants', 6),
  ('54534857-414e-4000-8000-000000000001', 'Fuel Levy', 7),
  ('54534857-414e-4000-8000-000000000001', 'Interest on Receivables', 8),
  ('54534857-414e-4000-8000-000000000001', 'Other Revenue', 9)
on conflict (municipality_id, name) do update set sort_order = excluded.sort_order;

with source as (
  select 'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'::text as url
), facts(year_label, scenario, category, amount) as (values
  ('2025/26','Adjustment Budget','Total Revenue',54288297444.82), ('2026/27','Budget','Total Revenue',58062407757.52), ('2027/28','Estimate','Total Revenue',61856483973.79), ('2028/29','Estimate','Total Revenue',63461729254.57),
  ('2025/26','Adjustment Budget','Electricity',20382766287.85), ('2026/27','Budget','Electricity',21878831156.59), ('2027/28','Estimate','Electricity',23830435701.24), ('2028/29','Estimate','Electricity',24602609643.67),
  ('2025/26','Adjustment Budget','Water',7243636185.41), ('2026/27','Budget','Water',8026631581.22), ('2027/28','Estimate','Water',8829294739.35), ('2028/29','Estimate','Water',9111832170.99),
  ('2025/26','Adjustment Budget','Waste Water Management',1965833933.25), ('2026/27','Budget','Waste Water Management',2064125629.91), ('2027/28','Estimate','Waste Water Management',2167331911.40), ('2028/29','Estimate','Waste Water Management',2236686532.57),
  ('2025/26','Adjustment Budget','Waste Management',2176029552.88), ('2026/27','Budget','Waste Management',2265246764.62), ('2027/28','Estimate','Waste Management',2254196330.92), ('2028/29','Estimate','Waste Management',2326330613.51),
  ('2025/26','Adjustment Budget','Property Rates',11280791057.71), ('2026/27','Budget','Property Rates',11884437687.15), ('2027/28','Estimate','Property Rates',12241737643.40), ('2028/29','Estimate','Property Rates',12633473247.97),
  ('2025/26','Adjustment Budget','Operational Grants',5249938361.38), ('2026/27','Budget','Operational Grants',5553306619.81), ('2027/28','Estimate','Operational Grants',5762614108.72), ('2028/29','Estimate','Operational Grants',5842947715.02),
  ('2025/26','Adjustment Budget','Fuel Levy',1666411000), ('2026/27','Budget','Fuel Levy',1875347000), ('2027/28','Estimate','Fuel Levy',2095993000), ('2028/29','Estimate','Fuel Levy',2311473000),
  ('2025/26','Adjustment Budget','Interest on Receivables',1484643833.57), ('2026/27','Budget','Interest on Receivables',1566299244.43), ('2027/28','Estimate','Interest on Receivables',1652445702.87), ('2028/29','Estimate','Interest on Receivables',1543547237.18),
  ('2025/26','Adjustment Budget','Other Revenue',2838247232.77), ('2026/27','Budget','Other Revenue',2944182073.79), ('2027/28','Estimate','Other Revenue',3022430835.85), ('2028/29','Estimate','Other Revenue',2812829093.66)
)
insert into public.revenue_facts (financial_year_id, category_id, scenario, amount, source_url)
select fy.id, rc.id, facts.scenario, facts.amount, source.url
from facts
join public.financial_years fy on fy.label = facts.year_label and fy.municipality_id = '54534857-414e-4000-8000-000000000001'
join public.revenue_categories rc on rc.name = facts.category and rc.municipality_id = fy.municipality_id
cross join source
on conflict (financial_year_id, category_id, scenario) do update set amount = excluded.amount, source_url = excluded.source_url;

insert into public.expenditure_categories (municipality_id, name, sort_order) values
  ('54534857-414e-4000-8000-000000000001', 'Total Expenditure', 0),
  ('54534857-414e-4000-8000-000000000001', 'Employee Related Costs', 1),
  ('54534857-414e-4000-8000-000000000001', 'Councillor Remuneration', 2),
  ('54534857-414e-4000-8000-000000000001', 'Bulk Purchases', 3),
  ('54534857-414e-4000-8000-000000000001', 'Inventory Consumed', 4),
  ('54534857-414e-4000-8000-000000000001', 'Debt Impairment', 5),
  ('54534857-414e-4000-8000-000000000001', 'Depreciation', 6),
  ('54534857-414e-4000-8000-000000000001', 'Finance Charges', 7),
  ('54534857-414e-4000-8000-000000000001', 'Contracted Services', 8),
  ('54534857-414e-4000-8000-000000000001', 'Transfers and Subsidies', 9),
  ('54534857-414e-4000-8000-000000000001', 'Operational Costs', 10),
  ('54534857-414e-4000-8000-000000000001', 'Repairs and Maintenance', 11)
on conflict (municipality_id, name) do update set sort_order = excluded.sort_order;

with source as (
  select 'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'::text as url
), facts(year_label, scenario, category, amount) as (values
  ('2025/26','Adjustment Budget','Total Expenditure',53080824146.42), ('2026/27','Budget','Total Expenditure',56584409805.20), ('2027/28','Estimate','Total Expenditure',60001570494.41), ('2028/29','Estimate','Total Expenditure',62184246566.01),
  ('2025/26','Adjustment Budget','Employee Related Costs',13113442974.86), ('2026/27','Budget','Employee Related Costs',13800556658.40), ('2027/28','Estimate','Employee Related Costs',14407025393.76), ('2028/29','Estimate','Employee Related Costs',15041453343.01),
  ('2025/26','Adjustment Budget','Councillor Remuneration',174172871.70), ('2026/27','Budget','Councillor Remuneration',182010650.90), ('2027/28','Estimate','Councillor Remuneration',190110124.91), ('2028/29','Estimate','Councillor Remuneration',198570025.41),
  ('2025/26','Adjustment Budget','Bulk Purchases',22147924207), ('2026/27','Budget','Bulk Purchases',24177206830.92), ('2027/28','Estimate','Bulk Purchases',26392309356.52), ('2028/29','Estimate','Bulk Purchases',27236863255.94),
  ('2025/26','Adjustment Budget','Inventory Consumed',5577405603), ('2026/27','Budget','Inventory Consumed',6071820301.67), ('2027/28','Estimate','Inventory Consumed',6774595683.41), ('2028/29','Estimate','Inventory Consumed',6987488969.22),
  ('2025/26','Adjustment Budget','Debt Impairment',5366436808.08), ('2026/27','Budget','Debt Impairment',6090539744.50), ('2027/28','Estimate','Debt Impairment',6510236275.99), ('2028/29','Estimate','Debt Impairment',6963590329.75),
  ('2025/26','Adjustment Budget','Depreciation',2440501367.75), ('2026/27','Budget','Depreciation',2530703453.42), ('2027/28','Estimate','Depreciation',2614216667.69), ('2028/29','Estimate','Depreciation',2697871600.37),
  ('2025/26','Adjustment Budget','Finance Charges',1686870523.77), ('2026/27','Budget','Finance Charges',1742481197.96), ('2027/28','Estimate','Finance Charges',1530503210.56), ('2028/29','Estimate','Finance Charges',1516629249.32),
  ('2025/26','Adjustment Budget','Contracted Services',4556173098), ('2026/27','Budget','Contracted Services',4371226511.05), ('2027/28','Estimate','Contracted Services',4375609762.64), ('2028/29','Estimate','Contracted Services',4437423533.72),
  ('2025/26','Adjustment Budget','Transfers and Subsidies',127212714.78), ('2026/27','Budget','Transfers and Subsidies',124527233.21), ('2027/28','Estimate','Transfers and Subsidies',128746511.23), ('2028/29','Estimate','Transfers and Subsidies',132522202.75),
  ('2025/26','Adjustment Budget','Operational Costs',2760866374.48), ('2026/27','Budget','Operational Costs',2820527739.38), ('2027/28','Estimate','Operational Costs',2905159064.87), ('2028/29','Estimate','Operational Costs',2985237743.53),
  ('2025/26','Adjustment Budget','Repairs and Maintenance',1466678000), ('2026/27','Budget','Repairs and Maintenance',1465720000), ('2027/28','Estimate','Repairs and Maintenance',1586711000), ('2028/29','Estimate','Repairs and Maintenance',1659282000)
)
insert into public.expenditure_facts (financial_year_id, category_id, scenario, amount, source_url)
select fy.id, ec.id, facts.scenario, facts.amount, source.url
from facts
join public.financial_years fy on fy.label = facts.year_label and fy.municipality_id = '54534857-414e-4000-8000-000000000001'
join public.expenditure_categories ec on ec.name = facts.category and ec.municipality_id = fy.municipality_id
cross join source
on conflict (financial_year_id, category_id, scenario) do update set amount = excluded.amount, source_url = excluded.source_url;

insert into public.departments (municipality_id, name) values
  ('54534857-414e-4000-8000-000000000001', 'Office of the COO'),
  ('54534857-414e-4000-8000-000000000001', 'Community and Social Development'),
  ('54534857-414e-4000-8000-000000000001', 'Emergency Services'),
  ('54534857-414e-4000-8000-000000000001', 'Tshwane Metro Police'),
  ('54534857-414e-4000-8000-000000000001', 'Economic Development and Spatial Planning'),
  ('54534857-414e-4000-8000-000000000001', 'Energy and Electricity'),
  ('54534857-414e-4000-8000-000000000001', 'Environment and Agriculture'),
  ('54534857-414e-4000-8000-000000000001', 'Group Audit and Risk'),
  ('54534857-414e-4000-8000-000000000001', 'Group Financial Services'),
  ('54534857-414e-4000-8000-000000000001', 'Health'),
  ('54534857-414e-4000-8000-000000000001', 'Human Settlements'),
  ('54534857-414e-4000-8000-000000000001', 'Regional Operations'),
  ('54534857-414e-4000-8000-000000000001', 'Roads and Transport'),
  ('54534857-414e-4000-8000-000000000001', 'Shared Services'),
  ('54534857-414e-4000-8000-000000000001', 'Water and Sanitation')
on conflict (municipality_id, name) do nothing;

with source as (
  select 'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'::text as url
), budgets(year_label, department, amount) as (values
  ('2026/27','Office of the COO',128326000), ('2027/28','Office of the COO',63446543), ('2028/29','Office of the COO',68000000),
  ('2026/27','Community and Social Development',21500000), ('2027/28','Community and Social Development',18500000), ('2028/29','Community and Social Development',19500000),
  ('2026/27','Emergency Services',6000000), ('2027/28','Emergency Services',6000000), ('2028/29','Emergency Services',6000000),
  ('2026/27','Tshwane Metro Police',98000000), ('2027/28','Tshwane Metro Police',128000000), ('2028/29','Tshwane Metro Police',128000000),
  ('2026/27','Economic Development and Spatial Planning',15942600), ('2027/28','Economic Development and Spatial Planning',27000000), ('2028/29','Economic Development and Spatial Planning',49400000),
  ('2026/27','Energy and Electricity',597268127), ('2027/28','Energy and Electricity',836531364), ('2028/29','Energy and Electricity',748353520),
  ('2026/27','Environment and Agriculture',114523740), ('2027/28','Environment and Agriculture',142776710), ('2028/29','Environment and Agriculture',168588380),
  ('2026/27','Group Audit and Risk',20000000), ('2027/28','Group Audit and Risk',20000000), ('2028/29','Group Audit and Risk',20000000),
  ('2026/27','Group Financial Services',2000000), ('2027/28','Group Financial Services',1000000), ('2028/29','Group Financial Services',0),
  ('2026/27','Health',18000000), ('2027/28','Health',0), ('2028/29','Health',0),
  ('2026/27','Human Settlements',416692640), ('2027/28','Human Settlements',516192640), ('2028/29','Human Settlements',581092640),
  ('2026/27','Regional Operations',38485286), ('2027/28','Regional Operations',28485286), ('2028/29','Regional Operations',10200000),
  ('2026/27','Roads and Transport',402545940), ('2027/28','Roads and Transport',458237220), ('2028/29','Roads and Transport',436142680),
  ('2026/27','Shared Services',253015600), ('2027/28','Shared Services',215500000), ('2028/29','Shared Services',232500000),
  ('2026/27','Water and Sanitation',720780933), ('2027/28','Water and Sanitation',1074660960), ('2028/29','Water and Sanitation',1369475060)
)
insert into public.department_budgets (department_id, financial_year_id, amount, source_url)
select d.id, fy.id, budgets.amount, source.url
from budgets
join public.departments d on d.name = budgets.department and d.municipality_id = '54534857-414e-4000-8000-000000000001'
join public.financial_years fy on fy.label = budgets.year_label and fy.municipality_id = d.municipality_id
cross join source
on conflict (department_id, financial_year_id) do update set amount = excluded.amount, source_url = excluded.source_url;

insert into public.capital_funding_sources (municipality_id, name, sort_order) values
  ('54534857-414e-4000-8000-000000000001', 'Council Funding', 1),
  ('54534857-414e-4000-8000-000000000001', 'Public Transport Infrastructure Grant', 2),
  ('54534857-414e-4000-8000-000000000001', 'Neighbourhood Development Partnership Grant', 3),
  ('54534857-414e-4000-8000-000000000001', 'Urban Settlements Development Grant', 4),
  ('54534857-414e-4000-8000-000000000001', 'Community Library Services Grant', 5),
  ('54534857-414e-4000-8000-000000000001', 'Public Contributions and Donations', 6),
  ('54534857-414e-4000-8000-000000000001', 'Informal Settlements Upgrading Partnership Grant', 7),
  ('54534857-414e-4000-8000-000000000001', 'Urban Development Financing Grant', 8),
  ('54534857-414e-4000-8000-000000000001', 'Social Housing Regulatory Authority', 9)
on conflict (municipality_id, name) do update set sort_order = excluded.sort_order;

with source as (
  select 'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'::text as url
), funding(year_label, source_name, amount) as (values
  ('2026/27','Council Funding',632984207), ('2027/28','Council Funding',549788150), ('2028/29','Council Funding',556323967),
  ('2026/27','Public Transport Infrastructure Grant',159800000), ('2027/28','Public Transport Infrastructure Grant',165869864), ('2028/29','Public Transport Infrastructure Grant',195800000),
  ('2026/27','Neighbourhood Development Partnership Grant',49326000), ('2027/28','Neighbourhood Development Partnership Grant',0), ('2028/29','Neighbourhood Development Partnership Grant',0),
  ('2026/27','Urban Settlements Development Grant',402932180), ('2027/28','Urban Settlements Development Grant',357677800), ('2028/29','Urban Settlements Development Grant',294975060),
  ('2026/27','Community Library Services Grant',14400000), ('2027/28','Community Library Services Grant',15400000), ('2028/29','Community Library Services Grant',16400000),
  ('2026/27','Public Contributions and Donations',59000000), ('2027/28','Public Contributions and Donations',140000000), ('2028/29','Public Contributions and Donations',140000000),
  ('2026/27','Informal Settlements Upgrading Partnership Grant',608492640), ('2027/28','Informal Settlements Upgrading Partnership Grant',703084130), ('2028/29','Informal Settlements Upgrading Partnership Grant',724935320),
  ('2026/27','Urban Development Financing Grant',920586560), ('2027/28','Urban Development Financing Grant',1122767100), ('2028/29','Urban Development Financing Grant',1417941900),
  ('2026/27','Social Housing Regulatory Authority',14500000), ('2027/28','Social Housing Regulatory Authority',0), ('2028/29','Social Housing Regulatory Authority',0)
)
insert into public.capital_funding_facts (source_id, financial_year_id, amount, source_url)
select cfs.id, fy.id, funding.amount, source.url
from funding
join public.capital_funding_sources cfs on cfs.name = funding.source_name and cfs.municipality_id = '54534857-414e-4000-8000-000000000001'
join public.financial_years fy on fy.label = funding.year_label and fy.municipality_id = cfs.municipality_id
cross join source
on conflict (source_id, financial_year_id) do update set amount = excluded.amount, source_url = excluded.source_url;

with projects(department, name, description, location, amount) as (values
  ('Roads and Transport','BRT CBD and surrounding areas','Public transport infrastructure for the bus rapid transit network.','CBD and surrounding areas',159800000),
  ('Roads and Transport','Internal roads in northern areas','Construction and upgrading of internal roads.','Northern Tshwane',17000000),
  ('Roads and Transport','Township development service contributions','Roads and stormwater contributions supporting township development.','Citywide',30000000),
  ('Roads and Transport','Stinkwater and New Eersterust flood backlog','Stormwater work addressing known flooding backlogs.','Stinkwater and New Eersterust',10000000),
  ('Roads and Transport','Soshanguve and Winterveldt flood backlog','Stormwater work addressing known flooding backlogs.','Soshanguve and Winterveldt',35000000),
  ('Roads and Transport','Rayton roads and stormwater upgrades','Upgrading road and stormwater infrastructure.','Rayton',28000000),
  ('Roads and Transport','Pegasus canal upgrade','Canal and stormwater infrastructure upgrade.','Pegasus',13000000),
  ('Water and Sanitation','Water conservation and demand management','Programmes to reduce water losses and improve demand management.','Citywide',120000000),
  ('Water and Sanitation','Reservoir extensions','Extensions to reservoir capacity across the city.','Citywide',64940549),
  ('Water and Sanitation','Wastewater treatment works upgrades','Capital upgrades to wastewater treatment facilities.','Citywide',158900000),
  ('Water and Sanitation','Water network pipe replacement','Replacement of worn water distribution pipes.','Citywide',101000000),
  ('Water and Sanitation','Alternative water supply','Development of alternative and resilient water sources.','Citywide',50000000),
  ('Human Settlements','Human settlements bulk water provision','Bulk water infrastructure supporting settlement development.','Priority settlements',163300000),
  ('Human Settlements','Human settlements bulk sewer provision','Bulk sewer infrastructure supporting settlement development.','Priority settlements',146000000),
  ('Shared Services','SAP S/4HANA implementation','Modernisation of the municipality enterprise resource platform.','Citywide',67000000),
  ('Shared Services','Municipal fleet renewal','Purchase of service-delivery vehicles and specialised fleet.','Citywide',131000000)
), source as (
  select 'https://www.tshwane.gov.za/wp-content/uploads/2026/03/19.-Draft-2026-2027-MTREF-for-CoT-1.pdf'::text as url
)
insert into public.capital_projects (
  municipality_id, department_id, financial_year_id, name, description, location, budget_amount, status, source_url
)
select
  '54534857-414e-4000-8000-000000000001', d.id, fy.id, projects.name, projects.description,
  projects.location, projects.amount, 'Budgeted', source.url
from projects
join public.departments d on d.name = projects.department and d.municipality_id = '54534857-414e-4000-8000-000000000001'
join public.financial_years fy on fy.label = '2026/27' and fy.municipality_id = d.municipality_id
cross join source
on conflict (municipality_id, financial_year_id, name) do update set
  department_id = excluded.department_id,
  description = excluded.description,
  location = excluded.location,
  budget_amount = excluded.budget_amount,
  status = excluded.status,
  source_url = excluded.source_url;
