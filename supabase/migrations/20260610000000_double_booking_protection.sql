-- BeautyBook: Double booking protection
-- Adiciona UNIQUE CONSTRAINT na tabela bookings para evitar reservas simultâneas no mesmo horário

-- SECURITY FIX: Add UNIQUE constraint to prevent double booking
-- Permite até 1 booking por (professional_id, date, status != 'cancelled')
alter table public.bookings
add constraint bookings_unique_professional_date_active 
  unique (professional_id, date, status) 
  where status != 'cancelled';

-- Índice para otimizar queries de verificação de disponibilidade
create index if not exists bookings_available_slots_idx 
  on public.bookings (professional_id, date) 
  where status in ('pending', 'confirmed');

-- Log de auditoria para rastrear tentativas de double booking
create table if not exists public.booking_audit_log (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles (id) on delete cascade,
  error_code text not null,
  error_message text,
  attempted_date timestamptz not null,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists booking_audit_log_professional_id_idx 
  on public.booking_audit_log (professional_id);

create index if not exists booking_audit_log_created_at_idx 
  on public.booking_audit_log (created_at);

-- RLS para auditoria
alter table public.booking_audit_log enable row level security;

drop policy if exists "booking_audit_log_select_own" on public.booking_audit_log;
create policy "booking_audit_log_select_own"
  on public.booking_audit_log for select to authenticated
  using (professional_id = auth.uid());

drop policy if exists "booking_audit_log_admin_select" on public.booking_audit_log;
create policy "booking_audit_log_admin_select"
  on public.booking_audit_log for select to authenticated
  using (public.is_admin());
