-- Ensure the public projection obeys the querying role's grants and RLS.
create or replace view public.public_issue_communications
with (security_invoker = true, security_barrier = true)
as
select
  c.id,
  i.issue_number,
  c.communication_type,
  c.recipient_email,
  c.subject,
  c.body,
  c.delivery_status,
  c.sent_at,
  c.created_at
from public.communications c
join public.issues i on i.id = c.issue_id;

create policy "Public can read issue communications"
on public.communications
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.issues
    where issues.id = communications.issue_id
  )
);

revoke all on public.communications from anon, authenticated;
grant select (
  id,
  issue_id,
  communication_type,
  recipient_email,
  subject,
  body,
  delivery_status,
  sent_at,
  created_at
) on public.communications to anon, authenticated;

revoke all on public.public_issue_communications from public;
grant select on public.public_issue_communications to anon, authenticated;

-- Trigger functions are not public RPC endpoints.
alter function public.set_updated_at() set search_path = '';
alter function public.generate_issue_number() set search_path = '';
alter function public.audit_issue_changes() set search_path = '';

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.generate_issue_number() from public, anon, authenticated;
revoke execute on function public.audit_issue_changes() from public, anon, authenticated;

-- Public buckets serve object URLs without a broad storage.objects SELECT policy.
drop policy if exists "Public issue photos are readable" on storage.objects;
