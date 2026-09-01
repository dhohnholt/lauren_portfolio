drop policy if exists "Admins can insert headshot settings" on public.site_settings;

revoke insert on table public.site_settings from authenticated;
