insert into public.site_settings (key, value)
values ('headshot_shift_x', '0')
on conflict (key) do nothing;

drop policy if exists "Public can read headshot settings" on public.site_settings;
drop policy if exists "Admins can update headshot settings" on public.site_settings;

create policy "Public can read headshot settings"
on public.site_settings
for select
to anon, authenticated
using (key in ('headshot_url', 'headshot_zoom', 'headshot_shift_x', 'headshot_shift_y'));

create policy "Admins can update headshot settings"
on public.site_settings
for update
to authenticated
using (
  key in ('headshot_url', 'headshot_zoom', 'headshot_shift_x', 'headshot_shift_y')
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  key in ('headshot_url', 'headshot_zoom', 'headshot_shift_x', 'headshot_shift_y')
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
