# Lauren Hohnholt Portfolio

A responsive portfolio website built with Next.js, TypeScript, and Supabase.

## Local development

1. Copy `.env.example` to `.env.local` and add the Supabase project values.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:3000`.

## Main routes

- `/` — About, selected projects, and experience overview
- `/projects` — Interactive four-project viewer
- `/resume` — Résumé placeholder structure
- `/contact` — Contact form prepared for a future Supabase table
- `/admin` — Authenticated headshot URL editor

Netlify can deploy this repository as a standard Next.js application. Add both `NEXT_PUBLIC_SUPABASE_*` variables in the Netlify environment settings.

## Database migration

Run the SQL in `supabase/migrations/20260901005107_initial_portfolio_schema.sql` in the Supabase SQL Editor, or link the local CLI project and run `supabase db push`. The migration creates public, read-only published projects and a write-only contact inbox protected by row-level security.

Run the migrations in timestamp order. After creating Lauren as an email/password user under Supabase Authentication, grant that account admin access from the SQL Editor:

```sql
insert into public.admin_users (user_id)
select id from auth.users where lower(email) = 'laurenhohnholt@gmail.com'
on conflict (user_id) do nothing;
```

The separate `20260901010422_grant_lauren_admin_access.sql` migration runs this allowlist statement. Lauren's Auth account must exist before it runs. If the account is created afterward, run the statement manually once. Only listed admin users can save changes from `/admin`.
