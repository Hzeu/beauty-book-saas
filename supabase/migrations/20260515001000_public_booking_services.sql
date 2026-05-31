 Public booking helpers expose only the minimum data needed by client booking pages.

create or replace function public.get_booking_services(p_id uuid)
returns table (
  id uuid,
  name text,
  price numeric,
  duration_minutes integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.name,
    s.price,
    s.duration_minutes
  from public.services s
  where s.professional_id = p_id
    and s.is_active = true
  order by s.display_order asc, s.name asc;
$$;

revoke all on function public.get_booking_services(uuid) from public;
grant execute on function public.get_booking_services(uuid) to anon, authenticated;

create or replace function public.get_booking_profile_by_identifier(p_identifier text)
returns table (
  id uuid,
  full_name text,
  slug text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(p.full_name, 'Profissional') as full_name,
    p.slug
  from public.profiles p
  where p.role = 'professional'
    and p.slug is not null
    and (
      lower(p.slug) = lower(p_identifier)
      or (
        p_identifier ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and p.id = p_identifier::uuid
      )
    )
  limit 1;
$$;

revoke all on function public.get_booking_profile_by_identifier(text) from public;
grant execute on function public.get_booking_profile_by_identifier(text) to anon, authenticated;
