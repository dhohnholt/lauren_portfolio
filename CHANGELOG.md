# Changelog

## Unreleased

- Initialized Lauren Hohnholt's Next.js portfolio.
- Added responsive About, Projects, Résumé, and Contact pages.
- Added an interactive four-project viewer prepared for Canva embeds.
- Added the Supabase browser client and environment-variable template.
- Configured the Next.js scripts to use Webpack for consistent local and Netlify builds.
- Added a Supabase migration for projects and contact messages with RLS policies and starter project records.
- Prepared the repository for its initial GitHub push and excluded machine-specific local settings.
- Added the requested headshot placeholder and a protected `/admin` page for updating its URL.
- Added an RLS-protected site settings migration and explicit admin allowlist.
- Configured `laurenhohnholt@gmail.com` as the portfolio administrator.
- Split the administrator assignment into an idempotent follow-up migration for databases where the headshot tables already exist.
