alter table public.wards
add column councillor_website_url text,
add column councillor_instagram_url text,
add column councillor_tiktok_url text,
add column councillor_facebook_url text;

grant insert (
  councillor_website_url,
  councillor_instagram_url,
  councillor_tiktok_url,
  councillor_facebook_url
) on public.wards to authenticated;

grant update (
  councillor_website_url,
  councillor_instagram_url,
  councillor_tiktok_url,
  councillor_facebook_url
) on public.wards to authenticated;
