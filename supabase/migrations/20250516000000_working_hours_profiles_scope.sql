-- BeautyBook: horários de trabalho ligados ao dono (profiles.id = auth.uid)
-- Não usa a tabela professionals.

create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time text not null,
  end_time text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists working_hours_professional_id_idx on public.working_hours (professional_id);

alter table public.working_hours enable row level security;

drop policy if exists "working_hours_select_own" on public.working_hours;
create policy "working_hours_select_own"
  on public.working_hours for select to authenticated
  using (working_hours.professional_id = auth.uid());

drop policy if exists "working_hours_insert_own" on public.working_hours;
create policy "working_hours_insert_own"
  on public.working_hours for insert to authenticated
  with check (working_hours.professional_id = auth.uid());

drop policy if exists "working_hours_update_own" on public.working_hours;
create policy "working_hours_update_own"
  on public.working_hours for update to authenticated
  using (working_hours.professional_id = auth.uid())
  with check (working_hours.professional_id = auth.uid());
