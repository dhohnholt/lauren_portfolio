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
- `/admin` — Authenticated portfolio studio for homepage copy, brand colors, headshot, project copy, presentations, preview images, and private contact messages
- `/admin/reset-password` — Supabase password-recovery destination for the admin account

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

Run `20260901010801_allow_admin_project_updates.sql` after the admin allowlist migration to let Lauren update each project's Canva presentation URL from the admin page. Then run `20260901011057_allow_admin_project_preview_updates.sql` to enable the paired preview-image URL for each project.

Run `20260901011842_add_portfolio_content_and_theme.sql` last to enable editable homepage copy, live theme colors, and project titles, categories, and summaries.

Run `20260901015757_add_admin_contact_inbox.sql` to let the public Contact form accept messages and expose them only to Lauren's allowlisted admin account.

Run `20260901022844_add_headshot_framing_controls.sql` to add the saved headshot zoom and vertical-position controls used by the admin Brand panel.

Run `20260901023816_add_headshot_horizontal_position.sql` if the framing migration was already applied before horizontal positioning was added.

Run `20260901024728_repair_headshot_settings_save.sql` to repair any missing headshot framing rows and allow the admin editor to safely create missing settings during save.

Run `20260901025200_restore_site_settings_update_only.sql` after the repair migration. The admin editor now updates the seeded framing rows without requiring browser-side insert access.

Run `20260901031330_enforce_complete_headshot_settings_policies.sql` to reconcile databases where earlier framing migrations were only partially applied. This migration is self-contained: it seeds all four settings and recreates their complete public-read/admin-update RLS policies.

## Contact email notifications

The Contact form calls the `notify-contact` Supabase Edge Function. The function validates and saves each message to the private admin inbox, then sends a branded notification to `laurenhohnholt@gmail.com` through Resend.

Set `RESEND_API_KEY` under Supabase Edge Function Secrets, then deploy the function:

```bash
supabase functions deploy notify-contact
```

Supabase Auth custom SMTP settings do not configure this function. It sends through
the Resend HTTP API, so the Edge Function needs `RESEND_API_KEY`. Its sender defaults
to `Lauren Hohnholt Portfolio <contact@laurenhohnholt.com>`; make sure
`laurenhohnholt.com` is verified in Resend, or set a verified sender with the optional
`CONTACT_FROM_EMAIL` Edge Function secret.

The dashboard's generated `{ name: "Functions" }` invocation example is not a valid
contact submission. Test with all required fields and inspect both `data` and `error`:

```ts
const { data, error } = await supabase.functions.invoke("notify-contact", {
  body: {
    name: "Email Test",
    email: "your-address@example.com",
    message: "This is a test of the portfolio contact notification.",
  },
});

console.log({ data, error });
```

A successful Resend handoff returns `notificationSent: true` and an `emailId`. If the
message was stored but Resend rejected it, the response returns `saved: true` and
`notificationSent: false`; the provider's detailed error is available in the function log.

The default sender is `Lauren Hohnholt Portfolio <contact@laurenhohnholt.com>`. If Resend is configured for a different verified sender, add a `CONTACT_FROM_EMAIL` Edge Function secret containing the complete sender value. Email delivery errors are logged by the function, while the original message remains available in `/admin`.

For password recovery, set the Supabase Site URL to `https://laurenhohnholt.com` and add `https://laurenhohnholt.com/admin/reset-password` under Authentication → URL Configuration → Redirect URLs. The “Forgot password?” action on `/admin` sends the recovery email to this route.
