-- BeautyBook: reservas públicas (bookings), slug automático no cadastro, RPCs para página pública
-- Requer migrations anteriores (profiles, working_hours, is_admin).

-- ---------------------------------------------------------------------------
-- Catálogo simples de serviços exibidos na página pública (JSON array de strings)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists service_catalog jsonb not null default '["Corte","Barba","Consulta"]'::jsonb;

-- ---------------------------------------------------------------------------
-- Tabela bookings (agendamento do cliente pela página pública)
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles (id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  service text not null,
  date timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_professional_id_idx on public.bookings (professional_id);
create index if not exists bookings_date_idx on public.bookings (date);
create index if not exists bookings_professional_date_idx on public.bookings (professional_id, date);

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select to authenticated
  using (professional_id = auth.uid());

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own"
  on public.bookings for update to authenticated
  using (professional_id = auth.uid())
  with check (professional_id = auth.uid());

drop policy if exists "bookings_insert_anon" on public.bookings;
create policy "bookings_insert_anon"
  on public.bookings for insert to anon
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = bookings.professional_id
        and p.role = 'professional'
        and p.slug is not null
        and p.is_active = true
    )
  );

drop policy if exists "bookings_insert_authenticated_public" on public.bookings;
create policy "bookings_insert_authenticated_public"
  on public.bookings for insert to authenticated
  with check (
    professional_id <> auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = bookings.professional_id
        and p.role = 'professional'
        and p.slug is not null
        and p.is_active = true
    )
  );

drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select"
  on public.bookings for select to authenticated
  using (public.is_admin());

drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update"
  on public.bookings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- RPCs SECURITY DEFINER (dados mínimos para página pública + conflitos de horário)
-- ---------------------------------------------------------------------------
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
  where p.slug = p_slug
    and p.role = 'professional'
    and p.is_active = true
  limit 1;
$$;

revoke all on function public.get_booking_profile(text) from public;
grant execute on function public.get_booking_profile(text) to anon, authenticated;

create or replace function public.get_working_hours_for_professional(p_id uuid)
returns setof public.working_hours
language sql
stable
security definer
set search_path = public
as $$
  select wh.*
  from public.working_hours wh
  where wh.professional_id = p_id
    and wh.is_active = true
  order by wh.day_of_week, wh.start_time;
$$;

revoke all on function public.get_working_hours_for_professional(uuid) from public;
grant execute on function public.get_working_hours_for_professional(uuid) to anon, authenticated;

create or replace function public.get_booking_occupied_times(p_id uuid, p_day date)
returns setof timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select b.date
  from public.bookings b
  where b.professional_id = p_id
    and (b.date at time zone 'America/Sao_Paulo')::date = p_day
    and b.status <> 'cancelled';
$$;

revoke all on function public.get_booking_occupied_times(uuid, date) from public;
grant execute on function public.get_booking_occupied_times(uuid, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- handle_new_user: slug automático para role professional (nome + trecho do id)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r text;
  display text;
  base_slug text;
  frag text;
  cand text;
  n int := 0;
begin
  r := meta->>'role';
  if r is null or r not in ('client', 'professional', 'admin') then
    r := 'professional';
  end if;

  display := trim(coalesce(meta->>'full_name', meta->>'name', ''));
  if display = '' then
    display := 'user';
  end if;

  base_slug := lower(regexp_replace(display, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from regexp_replace(base_slug, '-+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'user';
  end if;

  frag := substring(replace(new.id::text, '-', '') from 1 for 6);
  cand := base_slug || '-' || frag;

  while exists (select 1 from public.profiles where slug = cand) loop
    n := n + 1;
    cand := base_slug || '-' || frag || '-' || n::text;
    exit when n > 50;
  end loop;

  insert into public.profiles (id, email, full_name, role, slug)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(coalesce(meta->>'full_name', meta->>'name', '')), ''),
    r,
    case when r = 'professional' then cand else null end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    slug = coalesce(public.profiles.slug, excluded.slug),
    updated_at = now();

  return new;
end;
$$;
