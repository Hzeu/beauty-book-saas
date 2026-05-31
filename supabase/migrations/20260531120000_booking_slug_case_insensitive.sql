-- Slug na página pública: comparação case-insensitive (app/[slug] normaliza para minúsculas)
create or replace function public.get_booking_profile(p_slug text)
returns table (
  id uuid,
  full_name text,
  slug text,
  service_catalog jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(nullif(trim(p.full_name), ''), 'Profissional') as full_name,
    p.slug,
    coalesce(p.service_catalog, '[]'::jsonb) as service_catalog
  from public.profiles p
  where lower(p.slug) = lower(trim(p_slug))
    and p.role = 'professional'
    and p.is_active = true
  limit 1;
$$;
