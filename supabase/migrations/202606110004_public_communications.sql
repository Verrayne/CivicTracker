create or replace view public.public_issue_communications
with (security_barrier = true)
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

revoke all on public.public_issue_communications from public;
grant select on public.public_issue_communications to anon, authenticated;
