-- Restore least-privilege Data API grants. RLS remains the row-level boundary,
-- while these grants limit each role to the operations used by the application.
revoke all on table
  public.admin_users,
  public.contact_messages,
  public.portfolio_settings,
  public.projects,
  public.resume_content,
  public.site_settings
from anon, authenticated;

grant select on table public.projects to anon, authenticated;
grant insert on table public.projects to authenticated;
grant update (title, category, summary, canva_url, thumbnail_url, updated_at)
  on table public.projects to authenticated;

grant insert on table public.contact_messages to anon, authenticated;
grant select on table public.contact_messages to authenticated;

grant select on table public.site_settings to anon, authenticated;
grant update (value, updated_at, updated_by)
  on table public.site_settings to authenticated;

grant select on table public.admin_users to authenticated;

grant select on table public.portfolio_settings to anon, authenticated;
grant update on table public.portfolio_settings to authenticated;

grant select on table public.resume_content to anon, authenticated;
grant update (content, updated_at, updated_by)
  on table public.resume_content to authenticated;

revoke all on sequence public.contact_messages_id_seq, public.projects_id_seq
  from anon, authenticated;
grant usage, select on sequence public.contact_messages_id_seq to anon, authenticated;
grant usage, select on sequence public.projects_id_seq to authenticated;

-- Cover foreign keys used when Auth users are deleted or updated.
create index if not exists portfolio_settings_updated_by_idx
  on public.portfolio_settings (updated_by);
create index if not exists resume_content_updated_by_idx
  on public.resume_content (updated_by);
create index if not exists site_settings_updated_by_idx
  on public.site_settings (updated_by);

-- Give each API role one project SELECT policy. This preserves public access to
-- published work and lets allowlisted admins see drafts without duplicate policy
-- evaluation for authenticated requests.
drop policy if exists "Published projects are publicly readable" on public.projects;
drop policy if exists "Admins can read all project rows" on public.projects;

create policy "Published projects are publicly readable"
on public.projects
for select
to anon
using (is_published = true);

create policy "Authenticated users can read permitted project rows"
on public.projects
for select
to authenticated
using (
  is_published = true
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
