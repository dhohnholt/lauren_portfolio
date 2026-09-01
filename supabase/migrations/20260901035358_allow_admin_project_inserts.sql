grant insert on table public.projects to authenticated;
grant usage, select on sequence public.projects_id_seq to authenticated;

drop policy if exists "Admins can create project rows" on public.projects;

create policy "Admins can create project rows"
on public.projects
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
