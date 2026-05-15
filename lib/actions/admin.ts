'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') throw new Error('Acesso negado.')
  return supabase
}

export async function adminSetProfileBlocked(profileId: string, blocked: boolean) {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: blocked })
    .eq('id', profileId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function adminSetProfileActive(profileId: string, active: boolean) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('profiles').update({ is_active: active }).eq('id', profileId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function adminSetSubscriptionStatus(subscriptionId: string, status: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('subscriptions').update({ status }).eq('id', subscriptionId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  revalidatePath('/admin')
  return { success: true }
}

export async function adminDeactivateAccount(profileId: string) {
  const supabase = await requireAdmin()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user?.id === profileId) {
    return { error: 'Você não pode desativar a própria conta admin por aqui.' }
  }
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false, is_blocked: true })
    .eq('id', profileId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function adminDispatchForm(formData: FormData) {
  const intent = formData.get('intent') as string
  const profileId = String(formData.get('profileId') ?? '')
  const subscriptionId = formData.get('subscriptionId')
    ? String(formData.get('subscriptionId'))
    : null
  const status = formData.get('status') ? String(formData.get('status')) : null

  if (intent === 'set_subscription') {
    if (!subscriptionId || !status) return { error: 'Assinatura inválida.' }
    return adminSetSubscriptionStatus(subscriptionId, status)
  }

  if (!profileId) {
    return { error: 'Dados inválidos.' }
  }

  switch (intent) {
    case 'block_profile':
      return adminSetProfileBlocked(profileId, true)
    case 'unblock_profile':
      return adminSetProfileBlocked(profileId, false)
    case 'activate_profile':
      return adminSetProfileActive(profileId, true)
    case 'deactivate_profile':
      return adminSetProfileActive(profileId, false)
    case 'deactivate_account':
      return adminDeactivateAccount(profileId)
    default:
      return { error: 'Ação desconhecida.' }
  }
}
