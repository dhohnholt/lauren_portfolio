alter table public.contact_messages
add constraint contact_messages_email_format
check (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$');

revoke select on table public.contact_messages from anon;
grant select on table public.contact_messages to authenticated;

create policy "Admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
