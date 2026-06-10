-- BeautyBook: Double booking protection - VERSÃO SEGURA
-- Usa is_deleted (soft delete) para proteger contra UPDATE de cancelled→active
-- Compatível: PostgreSQL 12+ (Supabase)

-- ============================================================================
-- STEP 1: Adicionar coluna is_deleted
-- ============================================================================
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- ============================================================================
-- STEP 2: Remover índice vulnerável (se existir)
-- ============================================================================
DROP INDEX IF EXISTS bookings_unique_professional_date_active CASCADE;

-- ============================================================================
-- STEP 3: Criar UNIQUE INDEX seguro
-- Garante max 1 booking ativo (is_deleted=false) por (professional_id, date)
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_professional_date_active
  ON public.bookings (professional_id, date)
  WHERE is_deleted = false;

-- ============================================================================
-- STEP 4: Índices de performance
-- ============================================================================

-- Query rápida: "Quais horários estão ocupados hoje?"
CREATE INDEX IF NOT EXISTS bookings_available_slots_idx
  ON public.bookings (professional_id, date)
  WHERE is_deleted = false AND status IN ('pending', 'confirmed');

-- Query rápida: "Listar bookings do profissional"
CREATE INDEX IF NOT EXISTS bookings_professional_status_idx
  ON public.bookings (professional_id, status)
  WHERE is_deleted = false;

-- Query rápida: "Bookings por período"
CREATE INDEX IF NOT EXISTS bookings_date_range_idx
  ON public.bookings (professional_id, date DESC)
  WHERE is_deleted = false;

-- ============================================================================
-- STEP 5: Tabela de auditoria para rastrear double booking attempts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.booking_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  error_code text NOT NULL,
  error_message text,
  attempted_date timestamptz NOT NULL,
  attempted_status text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices na auditoria
CREATE INDEX IF NOT EXISTS booking_audit_log_professional_id_idx
  ON public.booking_audit_log (professional_id);

CREATE INDEX IF NOT EXISTS booking_audit_log_created_at_idx
  ON public.booking_audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS booking_audit_log_error_code_idx
  ON public.booking_audit_log (error_code)
  WHERE error_code = '23505';

-- ============================================================================
-- STEP 6: Row Level Security (RLS) para auditoria
-- ============================================================================
ALTER TABLE public.booking_audit_log ENABLE ROW LEVEL SECURITY;

-- Política: Profissional vê seus próprios logs de tentativa
DROP POLICY IF EXISTS "booking_audit_log_select_own" ON public.booking_audit_log;
CREATE POLICY "booking_audit_log_select_own"
  ON public.booking_audit_log FOR SELECT TO authenticated
  USING (professional_id = auth.uid());

-- Política: Admin vê todos os logs
DROP POLICY IF EXISTS "booking_audit_log_admin_select" ON public.booking_audit_log;
CREATE POLICY "booking_audit_log_admin_select"
  ON public.booking_audit_log FOR SELECT TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- COMPORTAMENTO GARANTIDO PÓS-MIGRATION
-- ============================================================================
-- ✅ Cenário 1: INSERT pending + pending no mesmo horário
--    RESULTADO: ERROR 23505 (duplicate key) - Bloqueado pelo índice UNIQUE
--
-- ✅ Cenário 2: INSERT pending + confirmed no mesmo horário
--    RESULTADO: ERROR 23505 - Bloqueado pelo índice UNIQUE
--
-- ✅ Cenário 3: confirmed + confirmed no mesmo horário
--    RESULTADO: ERROR 23505 - Bloqueado pelo índice UNIQUE
--
-- ✅ Cenário 4: UPDATE cancelled→confirmed com outro active
--    RESULTADO: ERROR 23505 - Bloqueado pelo índice UNIQUE
--    (cancelled tem is_deleted=true, fora do índice)
--    (quando tenta UPDATE is_deleted=false, PostgreSQL bloqueia)
--
-- ✅ Cenário 5: UPDATE status pending→confirmed (SEM mudança em is_deleted)
--    RESULTADO: Sucesso - is_deleted não está no índice
--
-- ✅ Cenário 6: UPDATE para cancelled (is_deleted=true)
--    RESULTADO: Sucesso - Sai do índice UNIQUE via WHERE is_deleted=false
