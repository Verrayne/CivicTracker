create extension if not exists pgcrypto;

create table public.wards (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  councillor_name text,
  councillor_email text,
  created_at timestamptz not null default now()
);

create table public.issue_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.routing_rules (
  id uuid primary key default gen_random_uuid(),
  issue_type_id uuid not null references public.issue_types(id) on delete cascade,
  email_address text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (issue_type_id, email_address)
);

create table public.issue_number_counters (
  ward_id uuid not null references public.wards(id) on delete cascade,
  issue_year integer not null,
  current_value integer not null default 0,
  primary key (ward_id, issue_year)
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  issue_number text unique,
  ward_id uuid not null references public.wards(id),
  issue_type_id uuid not null references public.issue_types(id),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 20 and 2000),
  street_address text not null,
  nearest_intersection text,
  latitude numeric(10,7) check (latitude between -90 and 90),
  longitude numeric(10,7) check (longitude between -180 and 180),
  status text not null default 'Open' check (status in ('Open', 'Reported', 'In Progress', 'Resolved', 'Closed')),
  reference_number text,
  reporter_name text,
  reporter_email text,
  reporter_mobile text,
  followup_count integer not null default 0 check (followup_count >= 0),
  last_followup_sent timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.issue_photos (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create table public.communications (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  communication_type text not null check (communication_type in ('initial', 'followup')),
  recipient_email text not null,
  subject text not null,
  body text not null,
  delivery_status text not null check (delivery_status in ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  response_received boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

create index issues_status_created_idx on public.issues(status, created_at desc);
create index issues_search_idx on public.issues using gin (
  to_tsvector('english', coalesce(issue_number, '') || ' ' || title || ' ' || description || ' ' || street_address)
);
create index issue_photos_issue_idx on public.issue_photos(issue_id);
create index communications_issue_idx on public.communications(issue_id, created_at desc);
create unique index communications_one_active_initial_idx
on public.communications(issue_id)
where communication_type = 'initial' and delivery_status in ('pending', 'sent');

create or replace function public.generate_issue_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
  ward_number text;
  current_year integer := extract(year from now())::integer;
begin
  if new.issue_number is not null then
    return new;
  end if;

  select substring(name from '[0-9]+') into ward_number
  from public.wards where id = new.ward_id;

  insert into public.issue_number_counters (ward_id, issue_year, current_value)
  values (new.ward_id, current_year, 1)
  on conflict (ward_id, issue_year)
  do update set current_value = issue_number_counters.current_value + 1
  returning current_value into next_number;

  new.issue_number := format('W%s-%s-%s', ward_number, current_year, lpad(next_number::text, 6, '0'));
  return new;
end;
$$;

create trigger set_issue_number
before insert on public.issues
for each row execute function public.generate_issue_number();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_issues_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

create or replace function public.audit_issue_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (entity_type, entity_id, action, old_values, new_values)
  values (
    'issue',
    coalesce(new.id, old.id),
    lower(tg_op),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) - array['reporter_name','reporter_email','reporter_mobile'] else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) - array['reporter_name','reporter_email','reporter_mobile'] else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger audit_issues
after insert or update or delete on public.issues
for each row execute function public.audit_issue_changes();

alter table public.wards enable row level security;
alter table public.issue_types enable row level security;
alter table public.routing_rules enable row level security;
alter table public.issue_number_counters enable row level security;
alter table public.issues enable row level security;
alter table public.issue_photos enable row level security;
alter table public.communications enable row level security;
alter table public.audit_log enable row level security;

create policy "Public can read wards" on public.wards for select to anon, authenticated using (true);
create policy "Public can read issue types" on public.issue_types for select to anon, authenticated using (true);
create policy "Public can read issues" on public.issues for select to anon, authenticated using (true);
create policy "Public can create issues" on public.issues for insert to anon, authenticated with check (
  status = 'Open' and followup_count = 0 and reference_number is null and last_followup_sent is null
);
create policy "Public can read photos" on public.issue_photos for select to anon, authenticated using (true);
create policy "Public can add photos" on public.issue_photos for insert to anon, authenticated with check (
  exists (
    select 1
    from public.issues
    where id = issue_id
      and issue_number = split_part(storage_path, '/', 1)
  )
);

revoke all on public.issues from anon, authenticated;
grant select (
  id, issue_number, ward_id, issue_type_id, title, description, street_address,
  nearest_intersection, latitude, longitude, status, reference_number,
  followup_count, last_followup_sent, created_at, updated_at
) on public.issues to anon, authenticated;
grant insert (
  ward_id, issue_type_id, title, description, street_address, nearest_intersection,
  latitude, longitude, reporter_name, reporter_email, reporter_mobile
) on public.issues to anon, authenticated;

grant select on public.wards, public.issue_types, public.issue_photos to anon, authenticated;
grant insert on public.issue_photos to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'issue-photos',
  'issue-photos',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public issue photos are readable"
on storage.objects for select to anon, authenticated
using (bucket_id = 'issue-photos');

create policy "Public can upload issue photos"
on storage.objects for insert to anon, authenticated
with check (
  bucket_id = 'issue-photos'
  and (storage.foldername(name))[1] ~ '^W[0-9]+-[0-9]{4}-[0-9]{6}$'
);
