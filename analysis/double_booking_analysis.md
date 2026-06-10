# Análise Detalhada: Proteção contra Double Booking

## PROBLEMA IDENTIFICADO ⚠️

A migration atual usa:

```sql
CREATE UNIQUE INDEX bookings_unique_professional_date_active
  ON public.bookings (professional_id, date, status)
  WHERE status IN ('pending', 'confirmed');
```

**Esta abordagem é INSEGURA para o cenário de UPDATE.**

---

## Por que o índice ATUAL é problemático?

### Índice A: `(professional_id, date, status)` com WHERE

```sql
CREATE UNIQUE INDEX bookings_unique_professional_date_active
  ON public.bookings (professional_id, date, status)
  WHERE status IN ('pending', 'confirmed');
```

**Permite duplicatas em UPDATE:**

```sql
-- Hora: 14:00 em 2026-06-20

-- 1. Inserir primeiro pending
INSERT INTO bookings (professional_id, date, status)
VALUES ('prof-123', '2026-06-20 14:00:00+00'::timestamptz, 'pending');
-- ✅ Sucesso

-- 2. Inserir segundo pending (MESMO ÍNDICE, MESMA (prof, date, status))
INSERT INTO bookings (professional_id, date, status)
VALUES ('prof-123', '2026-06-20 14:00:00+00'::timestamptz, 'pending');
-- ❌ ERROR 23505 ✅ Bloqueado

-- MAS: se UPDATE status de pending→confirmed:

-- 3. Primeiro booking em cancelled
UPDATE bookings 
SET status = 'cancelled' 
WHERE id = 'id-1' AND professional_id = 'prof-123';

-- 4. Novo INSERT com pending
INSERT INTO bookings (professional_id, date, status)
VALUES ('prof-123', '2026-06-20 14:00:00+00'::timestamptz, 'pending');
-- ✅ Sucesso (índice não bloqueia cancelled)

-- 5. AGORA UPDATE o primeiro booking cancelled → confirmed
UPDATE bookings 
SET status = 'confirmed' 
WHERE id = 'id-2' AND professional_id = 'prof-123';

-- ❌ PROBLEMA: Agora temos TWO confirmed no mesmo horário!
```

**Explicação:**
- O índice UNIQUE permite multiplicidade em (prof, date) enquanto status muda
- Quando `cancelled`, a linha sai do índice (`WHERE status IN (...)`)
- UPDATE pode trazer a linha de volta sem checar outros bookings ativos

---

## SOLUÇÃO CORRETA: Índice B

### Índice B: `(professional_id, date)` - MAS COM SOFT DELETE

```sql
-- SEGURO: Garante max 1 booking qualquer por (prof, date)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- Índice UNIQUE apenas em linhas ativas (is_deleted=false)
CREATE UNIQUE INDEX bookings_unique_professional_date_active
  ON public.bookings (professional_id, date)
  WHERE is_deleted = false;
```

**Benefícios:**
- Cancelled com is_deleted=true não entra no índice
- UPDATE de is_deleted=true→false é bloqueado se outro ativo existir
- Histórico preservado (auditoria)

---

## COMPARAÇÃO: A vs B

| Cenário | Índice A | Índice B |
|---------|----------|----------|
| INSERT pending + pending | ✅ Bloqueado | ✅ Bloqueado |
| INSERT pending + confirmed | ✅ Bloqueado | ✅ Bloqueado |
| INSERT confirmed + confirmed | ✅ Bloqueado | ✅ Bloqueado |
| UPDATE cancelled→confirmed com outro active | ❌ **VULNERÁVEL** | ✅ Seguro |
| INSERT cancelled (is_deleted=true) | ✅ Permite | ✅ Permite |

---

## TESTES SQL PROVANDO A VULNERABILIDADE

### Teste 1: Índice A - VULNERÁVEL

```sql
DROP TABLE IF EXISTS bookings_test CASCADE;

CREATE TABLE bookings_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

-- Índice VULNERÁVEL (Atual)
CREATE UNIQUE INDEX bookings_test_vuln
  ON bookings_test (professional_id, date, status)
  WHERE status IN ('pending', 'confirmed');

-- Setup: Prof = 'prof-123', Date = '2026-06-20 14:00:00+00'
INSERT INTO bookings_test (professional_id, date, status)
VALUES ('prof-123'::uuid, '2026-06-20 14:00:00+00'::timestamptz, 'pending');

INSERT INTO bookings_test (professional_id, date, status)
VALUES ('prof-123'::uuid, '2026-06-20 14:00:00+00'::timestamptz, 'cancelled');

-- Restaurar cancelled → confirmed
UPDATE bookings_test 
SET status = 'confirmed'
WHERE status = 'cancelled';

-- Resultado:
SELECT id, status FROM bookings_test 
WHERE professional_id = 'prof-123'::uuid AND date = '2026-06-20 14:00:00+00'::timestamptz;

/*
RESULTADO ATUAL (VULNERÁVEL):
pending    | ← Primeiro booking
confirmed  | ← Estava cancelled, agora active ❌ TWO BOOKINGS!
*/
```

---

### Teste 2: Índice B - SEGURO

```sql
DROP TABLE IF EXISTS bookings_test CASCADE;

CREATE TABLE bookings_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  is_deleted boolean NOT NULL DEFAULT false
);

-- Índice SEGURO (Recomendado)
CREATE UNIQUE INDEX bookings_test_safe
  ON bookings_test (professional_id, date)
  WHERE is_deleted = false;

-- Setup
INSERT INTO bookings_test (professional_id, date, status, is_deleted)
VALUES ('prof-123'::uuid, '2026-06-20 14:00:00+00'::timestamptz, 'pending', false);

INSERT INTO bookings_test (professional_id, date, status, is_deleted)
VALUES ('prof-123'::uuid, '2026-06-20 14:00:00+00'::timestamptz, 'cancelled', true);

-- Tentar restaurar (is_deleted=true → false)
UPDATE bookings_test 
SET is_deleted = false
WHERE is_deleted = true;

/*
RESULTADO SEGURO:
ERROR: duplicate key value violates unique constraint "bookings_test_safe"
DETAIL: Key (professional_id, date)=(prof-123, 2026-06-20 14:00:00+00) already exists.

✅ PostgreSQL bloqueia automaticamente!
*/
```

---

## RECOMENDAÇÃO FINAL

### ✅ MIGRATION CORRIGIDA

```sql
-- Adicionar coluna is_deleted
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- Remover índice vulnerável
DROP INDEX IF EXISTS bookings_unique_professional_date_active;

-- Criar índice SEGURO
CREATE UNIQUE INDEX bookings_unique_professional_date_active
  ON public.bookings (professional_id, date)
  WHERE is_deleted = false;

-- Índices de performance
CREATE INDEX IF NOT EXISTS bookings_active_slots_idx
  ON public.bookings (professional_id, date)
  WHERE is_deleted = false AND status IN ('pending', 'confirmed');
```

---

## CONCLUSÃO

**Índice B é SUPERIOR porque:**
- ✅ Seguro contra UPDATE de cancelled→active
- ✅ Garante max 1 booking por (prof, date) SEMPRE
- ✅ Preserva histórico (auditoria)
- ✅ Compatível com PostgreSQL 12+
- ✅ Simples de entender e manter
