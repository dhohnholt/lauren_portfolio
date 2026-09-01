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

Netlify can deploy this repository as a standard Next.js application. Add both `NEXT_PUBLIC_SUPABASE_*` variables in the Netlify environment settings.

## Database migration

Run the SQL in `supabase/migrations/20260901005107_initial_portfolio_schema.sql` in the Supabase SQL Editor, or link the local CLI project and run `supabase db push`. The migration creates public, read-only published projects and a write-only contact inbox protected by row-level security.
