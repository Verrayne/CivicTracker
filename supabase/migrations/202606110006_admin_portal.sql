alter table public.wards
add column councillor_mobile text;

alter table public.wards
add constraint wards_name_contains_number check (name ~ '[0-9]+');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  singleton boolean primary key default true check (singleton),
  email_delivery_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.app_settings (singleton, email_delivery_enabled)
values (true, false)
on conflict (singleton) do nothing;

alter table public.admin_users enable row level security;
alter table public.app_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

create policy "Admins can view their membership"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can read settings"
on public.app_settings
for select
to authenticated
using (public.is_admin());

create policy "Admins can update settings"
on public.app_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can create wards"
on public.wards
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update wards"
on public.wards
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete issues"
on public.issues
for delete
to authenticated
using (public.is_admin());

create policy "Admins can delete issue photo objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'issue-photos'
  and public.is_admin()
);

grant select on public.admin_users, public.app_settings to authenticated;
grant update (email_delivery_enabled, updated_at, updated_by) on public.app_settings to authenticated;
grant insert (name, councillor_name, councillor_email, councillor_mobile) on public.wards to authenticated;
grant update (name, councillor_name, councillor_email, councillor_mobile) on public.wards to authenticated;
grant delete on public.issues to authenticated;

revoke execute on function public.is_admin() from anon;
