create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

-- Before applying this migration in production, create these Vault secrets:
--   project_url: https://<project-ref>.supabase.co
--   cron_secret: a long random value also configured as the Edge Function CRON_SECRET
-- The job runs every day at 06:00 UTC (08:00 SAST).
select cron.schedule(
  'ward-47-daily-followups',
  '0 6 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/send-followups',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
