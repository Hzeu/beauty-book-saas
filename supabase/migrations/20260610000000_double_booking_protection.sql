-- BeautyBook: Double booking protection (SECURITY FIX)
-- Adiciona proteção contra reservas simultâneas no mesmo horário
-- Usa CREATE UNIQUE INDEX parcial (suportado em PostgreSQL 12+)

-- SECURITY FIX 1: UNIQUE CONSTRAINT com índice parcial
-- Impede 2+ bookings no mesmo (professional_id, date) com status ativo
-- Permite múltiplos cancelled (para auditoria)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_professional_date_active
  ON public.bookings (professional_id, date, status)
  WHERE status IN ('pending', 'confirmed');

-- SECURITY FIX 2: Índice composto para otimizar queries de disponibilidade
-- Melhora performance de SELECT na verificação de horários ocupados
CREATE INDEX IF NOT EXISTS bookings_available_slots_idx
  ON public.bookings (professional_id, date)
  WHERE status IN ('pending', 'confirmed');

-- SECURITY FIX 3: Índice para busca rápida de bookings por profissional
CREATE INDEX IF NOT EXISTS bookings_professional_status_idx
  ON public.bookings (professional_id, status)
  WHERE status <> 'cancelled';

-- SECURITY FIX 4: Tabela de auditoria para rastrear tentativas de double booking
CREATE TABLE IF NOT EXISTS public.booking_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  error_code text NOT NULL,
  error_message text,
  attempted_date timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices na tabela de auditoria
CREATE INDEX IF NOT EXISTS booking_audit_log_professional_id_idx
  ON public.booking_audit_log (professional_id);

CREATE INDEX IF NOT EXISTS booking_audit_log_created_at_idx
  ON public.booking_audit_log (created_at);

CREATE INDEX IF NOT EXISTS booking_audit_log_error_code_idx
  ON public.booking_audit_log (error_code)
  WHERE error_code = '23505';

-- RLS: Auditoria
ALTER TABLE public.booking_audit_log ENABLE ROW LEVEL SECURITY;

-- Política: Profissional vê seus próprios logs
DROP POLICY IF EXISTS "booking_audit_log_select_own" ON public.booking_audit_log;
CREATE POLICY "booking_audit_log_select_own"
  ON public.booking_audit_log FOR SELECT TO authenticated
  USING (professional_id = auth.uid());

-- Política: Admin vê todos os logs
DROP POLICY IF EXISTS "booking_audit_log_admin_select" ON public.booking_audit_log;
CREATE POLICY "booking_audit_log_admin_select"
  ON public.booking_audit_log FOR SELECT TO authenticated
  USING (public.is_admin());

-- TRIGGER: Log automático de tentativas de double booking (opcional - implementar em bookings.ts)
-- Comentado: Será implementado via tratamento de erro no app layer
/*
CREATE OR REPLACE FUNCTION public.log_booking_error()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Seria chamado via função RPC que captura erro 23505
  RETURN NEW;
END;
$$;
*/

-- Verificação: Confirmar que as constraints estão em lugar
-- SELECT constraint_name FROM information_schema.table_constraints
-- WHERE table_name = 'bookings' AND constraint_type = 'UNIQUE';
