import { createClient } from '@/lib/supabase/server'
import type { SubscriptionPlan, UserRole } from '@/lib/types/database'
import type { AdminUserRow } from '@/components/admin/admin-users-table'

type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_blocked: boolean | null
  is_active: boolean | null
  created_at: string
}

type SubscriptionRow = {
  id?: string
  professional_id: string
  plan: SubscriptionPlan | null
  status: string | null
  monthly_price_cents?: number | null
  created_at?: string
  updated_at?: string
}

type PaymentRow = {
  amount_cents: number | null
  status: string | null
}

export type AdminCounts = {
  totalUsers: number
  totalProfessionals: number
  totalClients: number
  blockedAccounts: number
  totalAdmins: number
  totalRevenueCents: number
  activeSubscriptions: number
  failedPayments: number
}

export type AdminFinanceSummary = {
  totalRevenueCents: number
  activeSubscriptions: number
  failedPayments: number
  planDistribution: Record<SubscriptionPlan, number>
  subscriptions: Array<{
    id: string
    professional_id: string
    professional_name: string
    professional_email: string
    plan: SubscriptionPlan | null
    status: string | null
    monthly_price_cents: number | null
    updated_at: string | null
  }>
}

export type AdminProfessionalRow = AdminUserRow & {
  clients_count: number
  subscription_updated_at: string | null
}

export async function loadAdminUsers(role?: UserRole, blockedOnly = false): Promise<AdminUserRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('profiles')
    .select('id, email, full_name, role, is_blocked, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (role) {
    query = query.eq('role', role)
  }

  if (blockedOnly) {
    query = query.eq('is_blocked', true)
  }

  const { data: profiles } = await query
  const rows = (profiles ?? []) as ProfileRow[]
  const ids = rows.map((profile) => profile.id)

  const { data: subscriptions } =
    ids.length > 0
      ? await supabase
          .from('subscriptions')
          .select('professional_id, plan, status, monthly_price_cents')
          .in('professional_id', ids)
      : { data: [] }

  const subscriptionByOwner = new Map(
    ((subscriptions ?? []) as SubscriptionRow[]).map((subscription) => [
      subscription.professional_id,
      subscription,
    ]),
  )

  return rows.map((profile) => {
    const subscription = subscriptionByOwner.get(profile.id)
    return {
      ...profile,
      plan: subscription?.plan ?? null,
      subscription_status: subscription?.status ?? null,
      monthly_price_cents: subscription?.monthly_price_cents ?? null,
    }
  })
}

export async function loadAdminCounts() {
  const supabase = await createClient()
  const [
    { count: totalUsers },
    { count: totalProfessionals },
    { count: totalClients },
    { count: blockedAccounts },
    { count: totalAdmins },
    { data: subscriptions },
    { data: failedPayments },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_blocked', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('subscriptions').select('monthly_price_cents, status'),
    supabase.from('payments').select('amount_cents, status').eq('status', 'failed'),
  ])

  const subscriptionRows = (subscriptions ?? []) as SubscriptionRow[]
  const activeSubscriptionRows = subscriptionRows.filter((subscription) =>
    ['active', 'trial'].includes(subscription.status ?? ''),
  )

  return {
    totalUsers: totalUsers ?? 0,
    totalProfessionals: totalProfessionals ?? 0,
    totalClients: totalClients ?? 0,
    blockedAccounts: blockedAccounts ?? 0,
    totalAdmins: totalAdmins ?? 0,
    totalRevenueCents: activeSubscriptionRows.reduce(
      (total, subscription) => total + (subscription.monthly_price_cents ?? 0),
      0,
    ),
    activeSubscriptions: activeSubscriptionRows.length,
    failedPayments: ((failedPayments ?? []) as PaymentRow[]).length,
  }
}

export async function loadAdminFinance(): Promise<AdminFinanceSummary> {
  const supabase = await createClient()
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, professional_id, plan, status, monthly_price_cents, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200)

  const subscriptionRows = (subscriptions ?? []) as SubscriptionRow[]
  const professionalIds = subscriptionRows.map((subscription) => subscription.professional_id)

  const { data: professionals } =
    professionalIds.length > 0
      ? await supabase.from('profiles').select('id, full_name, email').in('id', professionalIds)
      : { data: [] }

  const profileById = new Map(
    ((professionals ?? []) as Pick<ProfileRow, 'id' | 'full_name' | 'email'>[]).map((profile) => [
      profile.id,
      profile,
    ]),
  )

  const { data: failedPayments } = await supabase.from('payments').select('amount_cents, status').eq('status', 'failed')
  const activeRows = subscriptionRows.filter((subscription) => ['active', 'trial'].includes(subscription.status ?? ''))

  const planDistribution = subscriptionRows.reduce<Record<SubscriptionPlan, number>>(
    (totals, subscription) => {
      if (subscription.plan) totals[subscription.plan] += 1
      return totals
    },
    { basic: 0, professional: 0, premium: 0 },
  )

  return {
    totalRevenueCents: activeRows.reduce(
      (total, subscription) => total + (subscription.monthly_price_cents ?? 0),
      0,
    ),
    activeSubscriptions: activeRows.length,
    failedPayments: ((failedPayments ?? []) as PaymentRow[]).length,
    planDistribution,
    subscriptions: subscriptionRows.map((subscription) => {
      const professional = profileById.get(subscription.professional_id)
      return {
        id: subscription.id ?? subscription.professional_id,
        professional_id: subscription.professional_id,
        professional_name: professional?.full_name?.trim() || 'Unnamed professional',
        professional_email: professional?.email ?? '',
        plan: subscription.plan ?? null,
        status: subscription.status ?? null,
        monthly_price_cents: subscription.monthly_price_cents ?? null,
        updated_at: subscription.updated_at ?? null,
      }
    }),
  }
}

export async function loadAdminProfessionals(): Promise<AdminProfessionalRow[]> {
  const supabase = await createClient()
  const professionals = await loadAdminUsers('professional')
  const professionalIds = professionals.map((profile) => profile.id)

  const [{ data: clients }, { data: subscriptions }] = await Promise.all([
    professionalIds.length > 0
      ? supabase.from('clients').select('professional_id').in('professional_id', professionalIds)
      : { data: [] },
    professionalIds.length > 0
      ? supabase.from('subscriptions').select('professional_id, updated_at').in('professional_id', professionalIds)
      : { data: [] },
  ])

  const clientsByProfessional = new Map<string, number>()
  ;((clients ?? []) as Pick<{ professional_id: string }, 'professional_id'>[]).forEach((client) => {
    clientsByProfessional.set(client.professional_id, (clientsByProfessional.get(client.professional_id) ?? 0) + 1)
  })

  const subscriptionUpdatedByProfessional = new Map(
    ((subscriptions ?? []) as Pick<SubscriptionRow, 'professional_id' | 'updated_at'>[]).map((subscription) => [
      subscription.professional_id,
      subscription.updated_at ?? null,
    ]),
  )

  return professionals.map((professional) => ({
    ...professional,
    clients_count: clientsByProfessional.get(professional.id) ?? 0,
    subscription_updated_at: subscriptionUpdatedByProfessional.get(professional.id) ?? null,
  }))
}
