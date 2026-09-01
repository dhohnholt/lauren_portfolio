alter table public.projects
add constraint projects_canva_url_length
check (canva_url is null or char_length(canva_url) <= 2048);

grant update (canva_url, updated_at) on table public.projects to authenticated;

create policy "Admins can read all project rows"
on public.projects
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "Admins can update project presentation URLs"
on public.projects
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
