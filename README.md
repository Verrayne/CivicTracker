# WardWorks

A public municipal issue reporting and tracking application for Ward 47, Tshwane. Residents can log issues without creating an account, upload photographs, receive a public issue number, and follow progress.

## Stack

- React 19, TypeScript, Vite, Tailwind CSS
- React Router, React Hook Form, Zod, TanStack Query
- Supabase PostgreSQL, Storage, Edge Functions, Cron
- Resend transactional email
- Vercel hosting

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the frontend

Copy `.env.example` to `.env` and add the API settings from **Supabase > Project Settings > API**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Only the anon key belongs in the frontend. Never expose `SUPABASE_SERVICE_ROLE_KEY` as a `VITE_` variable.

### 3. Start the app

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

## Supabase setup

Install the [Supabase CLI](https://supabase.com/docs/guides/cli), authenticate, and link the repository to a project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Create the required Vault secrets before applying the scheduled-job migration:

```sql
select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co', 'project_url');
select vault.create_secret('REPLACE_WITH_A_LONG_RANDOM_VALUE', 'cron_secret');
```

Apply the migrations:

```bash
supabase db push
```

The migrations create:

- All tables, indexes, constraints, triggers, and audit logging
- Concurrent yearly issue-number generation (`W47-YYYY-NNNNNN`)
- Ward and issue-type seed data
- Public Storage bucket with upload limits
- Row-level security and column-level grants that keep reporter details private
- A daily follow-up schedule at 06:00 UTC

## Edge Functions and Resend

Verify a sending domain in [Resend](https://resend.com), then configure secrets:

```bash
supabase secrets set \
  RESEND_API_KEY=re_your_key \
  RESEND_FROM_EMAIL="WardWorks <notifications@wardworks.co.za>" \
  EMAIL_DELIVERY_ENABLED=false \
  CRON_SECRET=REPLACE_WITH_THE_SAME_LONG_RANDOM_VALUE
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available to hosted Supabase Edge Functions.

Deploy both functions:

```bash
supabase functions deploy send-issue-notification --no-verify-jwt
supabase functions deploy send-followups --no-verify-jwt
```

Notification delivery is deliberately asynchronous from the browser's perspective. A Resend failure is recorded in `communications`, but it does not roll back a resident's report.

Set `EMAIL_DELIVERY_ENABLED=true` only when municipal delivery is ready for production.

To test a follow-up run:

```bash
curl -X POST \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-followups"
```

## Vercel deployment

1. Import this repository into Vercel.
2. Keep the detected framework as **Vite**.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Project Settings > Environment Variables**.
4. Deploy.

`vercel.json` rewrites client-side routes to `index.html`, so report detail URLs work on direct navigation.

## Production checklist

- Replace seed routing emails if the municipality confirms different service addresses.
- Add the current councillor's details to the `wards` row if desired.
- Verify the Resend domain and use an address on that domain.
- Confirm Vault and Edge Function `CRON_SECRET` values match.
- Test location permissions and image uploads on iOS and Android.
- Review public report content and establish a moderation process.
- Configure Supabase database backups and Vercel/Supabase observability alerts.

## Status workflow

`Open` → `Reported` → `In Progress` → `Resolved` → `Closed`

The initial notification moves a new issue from `Open` to `Reported` when email succeeds. Further status changes are made directly in Supabase in version 1.

## Commands

```bash
npm run dev       # local development
npm run build     # type-check and production build
npm run lint      # lint the frontend
npm run preview   # preview the production build
```
# CivicTracker
# CivicTracker
