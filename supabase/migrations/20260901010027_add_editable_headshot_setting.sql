create table public.site_settings (
  key text primary key,
  value text not null check (char_length(value) between 1 and 2048),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;

grant select on table public.site_settings to anon, authenticated;
grant update on table public.site_settings to authenticated;
grant select on table public.admin_users to authenticated;

create policy "Public can read the headshot setting"
on public.site_settings
for select
to anon, authenticated
using (key = 'headshot_url');

create policy "Admins can view their own admin record"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Admins can update the headshot setting"
on public.site_settings
for update
to authenticated
using (
  key = 'headshot_url'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  key = 'headshot_url'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

insert into public.site_settings (key, value)
values (
  'headshot_url',
  'https://images.unsplash.com/photo-1699899657680-421c2c2d5064?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
);

comment on table public.admin_users is
  'Add Lauren auth user ID here from the Supabase SQL Editor to grant portfolio admin access.';
