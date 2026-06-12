alter table public.municipalities
add column if not exists website text,
add column if not exists employee_count integer check (employee_count is null or employee_count >= 0);

update public.municipalities
set
  name = 'City of Tshwane',
  website = 'https://www.tshwane.gov.za/',
  employee_count = 19300
where id = '54534857-414e-4000-8000-000000000001';

create table public.municipal_budget_summary (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  financial_year text not null,
  total_revenue numeric(18,2) not null check (total_revenue >= 0),
  total_expenditure numeric(18,2) not null check (total_expenditure >= 0),
  capital_budget numeric(18,2) not null check (capital_budget >= 0),
  operating_budget numeric(18,2) not null check (operating_budget >= 0),
  is_sample_data boolean not null default false,
  created_at timestamptz not null default now(),
  unique (municipality_id, financial_year)
);

create table public.municipal_budget_allocations (
  id uuid primary key default gen_random_uuid(),
  budget_summary_id uuid not null references public.municipal_budget_summary(id) on delete cascade,
  category text not null,
  amount numeric(18,2) not null check (amount >= 0),
  percentage numeric(6,2) not null check (percentage between 0 and 100),
  created_at timestamptz not null default now(),
  unique (budget_summary_id, category)
);

create table public.municipal_budget_documents (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  financial_year text not null,
  title text not null,
  document_url text not null,
  created_at timestamptz not null default now()
);

create table public.municipal_departments (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (municipality_id, name)
);

create table public.municipal_officials (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.municipal_departments(id) on delete cascade,
  full_name text not null,
  position text not null,
  email text,
  profile_image_url text,
  bio text,
  responsibilities text,
  manager_id uuid references public.municipal_officials(id) on delete set null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.municipal_kpis (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  department_name text not null,
  kpi_name text not null,
  target_value numeric(18,2) not null,
  actual_value numeric(18,2) not null,
  achievement_percentage numeric(7,2) not null,
  reporting_period text not null,
  is_sample_data boolean not null default false,
  created_at timestamptz not null default now()
);

create index municipal_budget_summary_municipality_idx
on public.municipal_budget_summary (municipality_id, financial_year desc);

create index municipal_budget_documents_municipality_idx
on public.municipal_budget_documents (municipality_id, financial_year desc);

create index municipal_departments_municipality_idx
on public.municipal_departments (municipality_id);

create index municipal_officials_department_idx
on public.municipal_officials (department_id, display_order);

create index municipal_officials_manager_idx
on public.municipal_officials (manager_id);

create index municipal_kpis_municipality_idx
on public.municipal_kpis (municipality_id, reporting_period desc);

alter table public.municipal_budget_summary enable row level security;
alter table public.municipal_budget_allocations enable row level security;
alter table public.municipal_budget_documents enable row level security;
alter table public.municipal_departments enable row level security;
alter table public.municipal_officials enable row level security;
alter table public.municipal_kpis enable row level security;

create policy "Public can read municipal budget summaries"
on public.municipal_budget_summary for select to anon, authenticated using (true);

create policy "Public can read municipal budget allocations"
on public.municipal_budget_allocations for select to anon, authenticated using (true);

create policy "Public can read municipal budget documents"
on public.municipal_budget_documents for select to anon, authenticated using (true);

create policy "Public can read municipal departments"
on public.municipal_departments for select to anon, authenticated using (true);

create policy "Public can read municipal officials"
on public.municipal_officials for select to anon, authenticated using (true);

create policy "Public can read municipal KPIs"
on public.municipal_kpis for select to anon, authenticated using (true);

grant select on
  public.municipal_budget_summary,
  public.municipal_budget_allocations,
  public.municipal_budget_documents,
  public.municipal_departments,
  public.municipal_officials,
  public.municipal_kpis
to anon, authenticated;

grant select (website, employee_count) on public.municipalities to anon, authenticated;

insert into public.municipal_budget_summary (
  id, municipality_id, financial_year, total_revenue, total_expenditure,
  capital_budget, operating_budget, is_sample_data
) values
  ('b0000000-0000-4000-8000-000000000023', '54534857-414e-4000-8000-000000000001', '2023/24', 48200000000, 47900000000, 4700000000, 43200000000, true),
  ('b0000000-0000-4000-8000-000000000024', '54534857-414e-4000-8000-000000000001', '2024/25', 50600000000, 50200000000, 4900000000, 45300000000, true),
  ('b0000000-0000-4000-8000-000000000025', '54534857-414e-4000-8000-000000000001', '2025/26', 52400000000, 51900000000, 5200000000, 46700000000, true)
on conflict (municipality_id, financial_year) do update set
  total_revenue = excluded.total_revenue,
  total_expenditure = excluded.total_expenditure,
  capital_budget = excluded.capital_budget,
  operating_budget = excluded.operating_budget,
  is_sample_data = excluded.is_sample_data;

insert into public.municipal_budget_allocations (
  budget_summary_id, category, amount, percentage
) values
  ('b0000000-0000-4000-8000-000000000025', 'Electricity', 12500000000, 24.08),
  ('b0000000-0000-4000-8000-000000000025', 'Water', 9200000000, 17.73),
  ('b0000000-0000-4000-8000-000000000025', 'Roads', 5400000000, 10.40),
  ('b0000000-0000-4000-8000-000000000025', 'Waste Management', 4600000000, 8.86),
  ('b0000000-0000-4000-8000-000000000025', 'Public Safety', 3800000000, 7.32),
  ('b0000000-0000-4000-8000-000000000025', 'Parks', 2100000000, 4.05),
  ('b0000000-0000-4000-8000-000000000025', 'Housing', 4400000000, 8.48),
  ('b0000000-0000-4000-8000-000000000025', 'Administration', 9900000000, 19.08)
on conflict (budget_summary_id, category) do update set
  amount = excluded.amount,
  percentage = excluded.percentage;

insert into public.municipal_budget_documents (
  id, municipality_id, financial_year, title, document_url
) values
  ('bd000000-0000-4000-8000-000000000001', '54534857-414e-4000-8000-000000000001', '2025/26', 'City of Tshwane Budget Portal', 'https://www.tshwane.gov.za/'),
  ('bd000000-0000-4000-8000-000000000002', '54534857-414e-4000-8000-000000000001', '2024/25', 'City of Tshwane Financial Documents', 'https://www.tshwane.gov.za/')
on conflict (id) do update set
  title = excluded.title,
  document_url = excluded.document_url;

insert into public.municipal_departments (id, municipality_id, name, description) values
  ('d0000000-0000-4000-8000-000000000001', '54534857-414e-4000-8000-000000000001', 'Executive Leadership', 'Political and administrative leadership of the municipality.'),
  ('d0000000-0000-4000-8000-000000000002', '54534857-414e-4000-8000-000000000001', 'Finance', 'Municipal budgeting, revenue, expenditure and financial governance.'),
  ('d0000000-0000-4000-8000-000000000003', '54534857-414e-4000-8000-000000000001', 'Roads and Transport', 'Road infrastructure, traffic systems and public transport.'),
  ('d0000000-0000-4000-8000-000000000004', '54534857-414e-4000-8000-000000000001', 'Utilities', 'Electricity, water and sanitation services.'),
  ('d0000000-0000-4000-8000-000000000005', '54534857-414e-4000-8000-000000000001', 'Community Services', 'Waste, parks, emergency and community-facing services.'),
  ('d0000000-0000-4000-8000-000000000006', '54534857-414e-4000-8000-000000000001', 'Human Settlements', 'Housing delivery and settlement planning.'),
  ('d0000000-0000-4000-8000-000000000007', '54534857-414e-4000-8000-000000000001', 'Corporate Services', 'People, technology, legal and organisational support.')
on conflict (municipality_id, name) do update set description = excluded.description;

insert into public.municipal_officials (
  id, department_id, full_name, position, email, bio, responsibilities, manager_id, display_order
) values
  ('f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Executive Mayor', 'Executive Mayor', 'mayor@tshwane.gov.za', 'Demonstration profile for the political head of the City of Tshwane.', 'Provides political leadership, sets strategic priorities and oversees the mayoral committee.', null, 1),
  ('f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'Speaker of Council', 'Speaker', 'speaker@tshwane.gov.za', 'Demonstration profile for the presiding officer of the municipal council.', 'Presides over council meetings and safeguards council rules and public participation.', null, 2),
  ('f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'Municipal Manager', 'Municipal Manager', 'citymanager@tshwane.gov.za', 'Demonstration profile for the accounting officer and administrative head.', 'Leads the municipal administration and is accountable for implementing council decisions.', null, 3),
  ('f0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000002', 'Chief Financial Officer', 'Chief Financial Officer', 'finance@tshwane.gov.za', 'Demonstration profile for the head of municipal finance.', 'Oversees budgeting, treasury, financial reporting and revenue management.', 'f0000000-0000-4000-8000-000000000003', 4),
  ('f0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000003', 'Roads and Transport Executive', 'Executive Director: Roads and Transport', 'roads@tshwane.gov.za', 'Demonstration profile for the executive responsible for mobility and roads.', 'Oversees roads, stormwater, traffic engineering and public transport delivery.', 'f0000000-0000-4000-8000-000000000003', 5),
  ('f0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000004', 'Utilities Executive', 'Executive Director: Utilities', 'utilities@tshwane.gov.za', 'Demonstration profile for the executive responsible for utility services.', 'Oversees electricity, water, sanitation and related infrastructure.', 'f0000000-0000-4000-8000-000000000003', 6),
  ('f0000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000005', 'Community Services Executive', 'Executive Director: Community Services', 'communityservices@tshwane.gov.za', 'Demonstration profile for the executive responsible for community services.', 'Oversees waste, parks, emergency and community facilities.', 'f0000000-0000-4000-8000-000000000003', 7),
  ('f0000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000006', 'Human Settlements Executive', 'Executive Director: Human Settlements', 'housing@tshwane.gov.za', 'Demonstration profile for the executive responsible for housing delivery.', 'Oversees housing programmes, informal settlement upgrading and spatial delivery.', 'f0000000-0000-4000-8000-000000000003', 8),
  ('f0000000-0000-4000-8000-000000000009', 'd0000000-0000-4000-8000-000000000007', 'Corporate Services Executive', 'Executive Director: Corporate Services', 'corporateservices@tshwane.gov.za', 'Demonstration profile for the executive responsible for organisational support.', 'Oversees human resources, technology, legal services and governance support.', 'f0000000-0000-4000-8000-000000000003', 9)
on conflict (id) do update set
  full_name = excluded.full_name,
  position = excluded.position,
  email = excluded.email,
  bio = excluded.bio,
  responsibilities = excluded.responsibilities,
  manager_id = excluded.manager_id,
  display_order = excluded.display_order;

insert into public.municipal_kpis (
  id, municipality_id, department_name, kpi_name, target_value,
  actual_value, achievement_percentage, reporting_period, is_sample_data
) values
  ('a0000000-0000-4000-8000-000000000001', '54534857-414e-4000-8000-000000000001', 'Roads and Transport', 'Road maintenance programme completed', 100, 92, 92, '2025/26 Q2', true),
  ('a0000000-0000-4000-8000-000000000002', '54534857-414e-4000-8000-000000000001', 'Utilities', 'Water service interruptions restored within target', 100, 84, 84, '2025/26 Q2', true),
  ('a0000000-0000-4000-8000-000000000003', '54534857-414e-4000-8000-000000000001', 'Community Services', 'Waste collection schedule achieved', 100, 68, 68, '2025/26 Q2', true),
  ('a0000000-0000-4000-8000-000000000004', '54534857-414e-4000-8000-000000000001', 'Human Settlements', 'Planned housing milestones achieved', 100, 76, 76, '2025/26 Q2', true),
  ('a0000000-0000-4000-8000-000000000005', '54534857-414e-4000-8000-000000000001', 'Finance', 'Capital budget expenditure against plan', 100, 89, 89, '2025/26 Q2', true)
on conflict (id) do update set
  department_name = excluded.department_name,
  kpi_name = excluded.kpi_name,
  target_value = excluded.target_value,
  actual_value = excluded.actual_value,
  achievement_percentage = excluded.achievement_percentage,
  reporting_period = excluded.reporting_period,
  is_sample_data = excluded.is_sample_data;
