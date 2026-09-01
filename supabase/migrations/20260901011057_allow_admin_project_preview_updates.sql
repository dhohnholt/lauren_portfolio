alter table public.projects
add constraint projects_thumbnail_url_length
check (thumbnail_url is null or char_length(thumbnail_url) <= 2048);

grant update (thumbnail_url) on table public.projects to authenticated;
