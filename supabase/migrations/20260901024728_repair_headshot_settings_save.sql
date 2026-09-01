insert into public.site_settings (key, value)
values
  ('headshot_url', 'https://images.unsplash.com/photo-1699899657680-421c2c2d5064?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
  ('headshot_zoom', '100'),
  ('headshot_shift_x', '0'),
  ('headshot_shift_y', '0')
on conflict (key) do nothing;

grant insert on table public.site_settings to authenticated;

drop policy if exists "Admins can insert headshot settings" on public.site_settings;

create policy "Admins can insert headshot settings"
on public.site_settings
for insert
to authenticated
with check (
  key in ('headshot_url', 'headshot_zoom', 'headshot_shift_x', 'headshot_shift_y')
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
