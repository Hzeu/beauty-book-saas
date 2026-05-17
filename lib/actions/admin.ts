'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SubscriptionPlan, UserRole } from '@/lib/types/database'

const ADMIN_REVALIDATE_PATHS = [
  '/admin',
  '/admin/users',
  '/admin/professionals',
  '/admin/blocked',
  '/admin/plans',
  '/admin/finance',
  '/admin/analytics',
]

function revalidateAdmin() {
  ADMIN_REVALIDATE_PATHS.forEach((path) => revalidatePath(path))
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nao autenticado.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') throw new Error('Acesso negado.')
  return { supabase, adminId: user.id }
}

export async function adminSetProfileBlocked(profileId: string, blocked: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('profiles').update({ is_blocked: blocked }).eq('id', profileId)
  if (error) return { error: error.message }
  revalidateAdmin()
  return { success: true }
}

export async function adminSetProfileRole(profileId: string, role: UserRole) {
  const { supabase, adminId } = await requireAdmin()

  if (adminId === profileId && role !== 'admin') {
    return { error: 'Voce nao pode remover o proprio papel de admin por aqui.' }
  }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId)
  if (error) return { error: error.message }
  revalidateAdmin()
  return { success: true }
}

export async function adminSetProfilePlan(profileId: string, plan: SubscriptionPlan) {
  const { supabase } = await requireAdmin()

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('professional_id', profileId)
    .maybeSingle()

  const payload = {
    professional_id: profileId,
    plan,
    status: 'active' as const,
  }

  if (!existing?.id) {
    return {
      error:
        'Este profissional ainda não possui assinatura registrada. Peça para concluir o onboarding antes de alterar o plano.',
    }
  }

  const { error } = await supabase.from('subscriptions').update(payload).eq('professional_id', profileId)

  if (error) return { error: error.message }
  revalidateAdmin()
  return { success: true }
}

export async function adminSetProfileActive(profileId: string, active: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('profiles').update({ is_active: active }).eq('id', profileId)
  if (error) return { error: error.message }
  revalidateAdmin()
  return { success: true }
}

export async function adminSetSubscriptionStatus(subscriptionId: string, status: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('subscriptions').update({ status }).eq('id', subscriptionId)
  if (error) return { error: error.message }
  revalidateAdmin()
  return { success: true }
}

export async function adminDeactivateAccount(profileId: string) {
  const { supabase, adminId } = await requireAdmin()
  if (adminId === profileId) {
    return { error: 'Voce nao pode desativar a propria conta admin por aqui.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false, is_blocked: true })
    .eq('id', profileId)

  if (error) return { error: error.message }
  revalidateAdmin()
  return { success: true }
}

export async function adminSoftDeleteProfile(profileId: string) {
  const { supabase, adminId } = await requireAdmin()
  if (adminId === profileId) {
    return { error: 'Voce nao pode excluir a propria conta admin por aqui.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false, is_blocked: true })
    .eq('id', profileId)

  if (error) return { error: error.message }
  revalidateAdmin()
  return { success: true }
}

export async function adminDispatchForm(formData: FormData) {
  const intent = String(formData.get('intent') ?? '')
  const profileId = String(formData.get('profileId') ?? '')
  const subscriptionId = formData.get('subscriptionId') ? String(formData.get('subscriptionId')) : null
  const status = formData.get('status') ? String(formData.get('status')) : null
  const role = formData.get('role') ? String(formData.get('role')) : null
  const plan = formData.get('plan') ? String(formData.get('plan')) : null

  if (intent === 'set_subscription') {
    if (!subscriptionId || !status) return { error: 'Assinatura invalida.' }
    return adminSetSubscriptionStatus(subscriptionId, status)
  }

  if (!profileId) {
    return { error: 'Dados invalidos.' }
  }

  switch (intent) {
    case 'block_profile':
      return adminSetProfileBlocked(profileId, true)
    case 'unblock_profile':
      return adminSetProfileBlocked(profileId, false)
    case 'set_role':
      if (role !== 'admin' && role !== 'professional' && role !== 'client') {
        return { error: 'Papel invalido.' }
      }
      return adminSetProfileRole(profileId, role)
    case 'set_plan':
      if (plan !== 'basic' && plan !== 'professional' && plan !== 'premium') {
        return { error: 'Plano invalido.' }
      }
      return adminSetProfilePlan(profileId, plan)
    case 'activate_profile':
      return adminSetProfileActive(profileId, true)
    case 'deactivate_profile':
      return adminSetProfileActive(profileId, false)
    case 'soft_delete_profile':
      return adminSoftDeleteProfile(profileId)
    case 'deactivate_account':
      return adminDeactivateAccount(profileId)
    default:
      return { error: 'Acao desconhecida.' }
  }
}
