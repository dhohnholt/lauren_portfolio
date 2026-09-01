create table public.portfolio_settings (
  id smallint primary key default 1 check (id = 1),
  hero_eyebrow text not null check (char_length(hero_eyebrow) between 1 and 120),
  hero_title text not null check (char_length(hero_title) between 1 and 160),
  hero_body text not null check (char_length(hero_body) between 1 and 1000),
  primary_cta_label text not null check (char_length(primary_cta_label) between 1 and 80),
  secondary_cta_label text not null check (char_length(secondary_cta_label) between 1 and 80),
  projects_eyebrow text not null check (char_length(projects_eyebrow) between 1 and 120),
  projects_title text not null check (char_length(projects_title) between 1 and 220),
  experience_eyebrow text not null check (char_length(experience_eyebrow) between 1 and 120),
  experience_title text not null check (char_length(experience_title) between 1 and 180),
  experience_body text not null check (char_length(experience_body) between 1 and 1000),
  experience_link_label text not null check (char_length(experience_link_label) between 1 and 80),
  footer_tagline text not null check (char_length(footer_tagline) between 1 and 160),
  color_olive text not null check (color_olive ~ '^#[0-9A-Fa-f]{6}$'),
  color_berry text not null check (color_berry ~ '^#[0-9A-Fa-f]{6}$'),
  color_sand text not null check (color_sand ~ '^#[0-9A-Fa-f]{6}$'),
  color_ink text not null check (color_ink ~ '^#[0-9A-Fa-f]{6}$'),
  color_mist text not null check (color_mist ~ '^#[0-9A-Fa-f]{6}$'),
  color_paper text not null check (color_paper ~ '^#[0-9A-Fa-f]{6}$'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.portfolio_settings enable row level security;

grant select on table public.portfolio_settings to anon, authenticated;
grant update on table public.portfolio_settings to authenticated;
grant update (title, category, summary) on table public.projects to authenticated;

create policy "Portfolio settings are publicly readable"
on public.portfolio_settings
for select
to anon, authenticated
using (id = 1);

create policy "Admins can update portfolio settings"
on public.portfolio_settings
for update
to authenticated
using (
  id = 1
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  id = 1
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

insert into public.portfolio_settings (
  id, hero_eyebrow, hero_title, hero_body, primary_cta_label,
  secondary_cta_label, projects_eyebrow, projects_title,
  experience_eyebrow, experience_title, experience_body,
  experience_link_label, footer_tagline, color_olive, color_berry,
  color_sand, color_ink, color_mist, color_paper
)
values (
  1,
  'Designer · Creator · Problem solver',
  'Hi, I''m Lauren.',
  'I turn thoughtful ideas into clear, memorable work. This portfolio is a growing collection of projects that show how I think, create, and bring a concept to life.',
  'Explore my work',
  'Let''s connect',
  'Selected work',
  'Four projects, one creative point of view.',
  'Experience',
  'Learning by making.',
  'Lauren''s résumé, education, and experience will live here as her portfolio grows. The structure is ready for real milestones, roles, and accomplishments.',
  'View résumé',
  'Designed with curiosity. Built with care.',
  '#6a713e', '#47122f', '#a18a7b', '#260e18', '#c9c7c8', '#f5f1ed'
);
