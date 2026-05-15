-- BeautyBook: extensões SaaS (admin, bloqueio, assinaturas, pagamentos)
-- professional_id = public.profiles.id (= auth.users.id). Não usa tabela professionals.

-- ---------------------------------------------------------------------------
-- Admin helper (SECURITY DEFINER evita recursão em RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles: bloqueio + dados de negócio (onboarding)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

alter table public.profiles
  add column if not exists slug text,
  add column if not exists category text,
  add column if not exists city text,
  add column if not exists state text;

create unique index if not exists profiles_slug_unique
  on public.profiles (slug)
  where slug is not null and length(trim(slug)) > 0;

alter table public.profiles drop constraint if exists profiles_category_check;
alter table public.profiles
  add constraint profiles_category_check
  check (
    category is null
    or category in (
      'manicure', 'nail_designer', 'cabeleireira', 'barbeiro',
      'lash_designer', 'estetica', 'outros'
    )
  );

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null default 'professional',
  status text not null default 'trial',
  monthly_price_cents integer default 4990,
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_one_per_professional
  on public.subscriptions (professional_id);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select to authenticated
  using (subscriptions.professional_id = auth.uid());

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own"
  on public.subscriptions for insert to authenticated
  with check (subscriptions.professional_id = auth.uid());

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
  on public.subscriptions for update to authenticated
  using (subscriptions.professional_id = auth.uid())
  with check (subscriptions.professional_id = auth.uid());

-- ---------------------------------------------------------------------------
-- subscriptions: preço mensal + status expandido
-- ---------------------------------------------------------------------------
alter table public.subscriptions
  add column if not exists monthly_price_cents integer default 4990;

alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;

alter table public.subscriptions
  add constraint subscriptions_status_check
  check (
    status in (
      'active', 'trial', 'past_due', 'canceled', 'suspended',
      'expired', 'blocked'
    )
  );

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents integer not null default 4990,
  currency text not null default 'BRL',
  status text not null default 'paid' check (status in ('pending', 'paid', 'failed', 'refunded')),
  description text,
  paid_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create index if not exists payments_professional_id_idx on public.payments (professional_id);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments for select to authenticated
  using (payments.professional_id = auth.uid());

drop policy if exists "payments_admin_select" on public.payments;
create policy "payments_admin_select"
  on public.payments for select to authenticated
  using (public.is_admin());

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
  on public.payments for insert to authenticated
  with check (payments.professional_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS: admin lê / atualiza dados operacionais
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "subscriptions_admin_select" on public.subscriptions;
create policy "subscriptions_admin_select"
  on public.subscriptions for select to authenticated
  using (public.is_admin());

drop policy if exists "subscriptions_admin_update" on public.subscriptions;
create policy "subscriptions_admin_update"
  on public.subscriptions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "clients_admin_select" on public.clients;
create policy "clients_admin_select"
  on public.clients for select to authenticated
  using (public.is_admin());

drop policy if exists "clients_insert_professional" on public.clients;
create policy "clients_insert_professional"
  on public.clients for insert to authenticated
  with check (clients.professional_id = auth.uid());

drop policy if exists "clients_update_professional" on public.clients;
create policy "clients_update_professional"
  on public.clients for update to authenticated
  using (clients.professional_id = auth.uid());

drop policy if exists "clients_select_professional" on public.clients;
create policy "clients_select_professional"
  on public.clients for select to authenticated
  using (clients.professional_id = auth.uid());

drop policy if exists "appointments_admin_select" on public.appointments;
create policy "appointments_admin_select"
  on public.appointments for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Conta MASTER ADMIN (troque o email pelo seu usuário já criado no Auth)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'seu@email.com';
-- ---------------------------------------------------------------------------
