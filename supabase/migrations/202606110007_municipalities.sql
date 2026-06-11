create table public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  province text not null,
  created_at timestamptz not null default now()
);

insert into public.municipalities (id, name, province)
values ('54534857-414e-4000-8000-000000000001', 'Tshwane', 'Gauteng');

alter table public.wards
add column municipality_id uuid references public.municipalities(id);

update public.wards
set municipality_id = '54534857-414e-4000-8000-000000000001'
where municipality_id is null;

alter table public.wards
alter column municipality_id set not null;

alter table public.wards
drop constraint if exists wards_name_key;

alter table public.wards
add constraint wards_municipality_name_key unique (municipality_id, name);

alter table public.municipalities enable row level security;

create policy "Public can read municipalities"
on public.municipalities
for select
to anon, authenticated
using (true);

create policy "Admins can create municipalities"
on public.municipalities
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update municipalities"
on public.municipalities
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.municipalities to anon, authenticated;
grant insert (name, province) on public.municipalities to authenticated;
grant update (name, province) on public.municipalities to authenticated;

grant insert (municipality_id) on public.wards to authenticated;
grant update (municipality_id) on public.wards to authenticated;
