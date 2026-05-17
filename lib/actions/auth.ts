'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole, ProfessionalCategory } from '@/lib/types/database'
import { generateSlug } from '@/lib/helpers'
import { getSiteUrl, safeInternalPath } from '@/lib/utils/site-url'

export type AuthActionResult = {
  success?: boolean
  error?: string
  redirect?: string
}

function destinationForRole(role: UserRole | null | undefined) {
  if (role === 'admin') return '/admin'
  if (role === 'professional') return '/dashboard'
  return '/'
}

function isRedirectAllowedForRole(path: string, role: UserRole | null | undefined) {
  if (!path) return false
  if (path.startsWith('/admin')) return role === 'admin'
  if (path.startsWith('/dashboard')) return role === 'professional'
  if (path.startsWith('/onboarding')) return role === 'professional'
  return true
}

export async function signUp(
  _prev: AuthActionResult | undefined,
  formData: FormData,
): Promise<AuthActionResult | undefined> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = (formData.get('role') as UserRole) || 'professional'

  if (!email || !password || !fullName) {
    return { error: 'Por favor, preencha todos os campos.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  const siteUrl = await getSiteUrl()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email já está cadastrado.' }
    }
    return { error: error.message }
  }

  if (data.session) {
    redirect('/onboarding')
  }

  return { success: true }
}

export async function signIn(
  _prev: AuthActionResult | undefined,
  formData: FormData,
): Promise<AuthActionResult | undefined> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = safeInternalPath(
    (formData.get('redirect') as string | null)?.trim() || null,
    '',
  )

  if (!email || !password) {
    return { error: 'Por favor, preencha todos os campos.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email ou senha incorretos.' }
    }
    return { error: error.message }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, category, is_blocked')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      redirect('/auth/login')
    }

    if (profile.is_blocked === true) {
      redirect('/blocked')
    }

    if (isRedirectAllowedForRole(redirectTo, profile.role)) {
      redirect(redirectTo)
    }

    if (profile?.role === 'professional' && !profile.category) {
      redirect('/onboarding')
    }

    redirect(destinationForRole(profile?.role))
  }

  redirect('/auth/login')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'global' })
  redirect('/auth/login')
}

export async function resetPassword(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Por favor, informe seu email.' }
  }

  const siteUrl = await getSiteUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Por favor, preencha todos os campos.' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não conferem.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, redirect: '/dashboard' }
}

export async function completeOnboarding(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const displayName = formData.get('displayName') as string
  const category = formData.get('category') as ProfessionalCategory
  const phone = formData.get('phone') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string

  if (!displayName || !category) {
    return { error: 'Por favor, preencha os campos obrigatórios.' }
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('slug, category')
    .eq('id', user.id)
    .maybeSingle()

  if (existingProfile?.category) {
    return { success: true, redirect: '/dashboard' }
  }

  let slug = existingProfile?.slug ?? null
  if (!slug) {
    const baseSlug = generateSlug(displayName) || `profissional-${user.id.slice(0, 8)}`
    slug = baseSlug
    const { data: slugTaken } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .neq('id', user.id)
      .maybeSingle()

    if (slugTaken) {
      slug = `${baseSlug}-${user.id.replace(/-/g, '').slice(0, 10)}`
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: displayName.trim(),
      phone: phone?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      category,
      slug,
    })
    .eq('id', user.id)

  if (profileError) {
    const msg = profileError.message || ''
    if (profileError.code === '23505' || msg.includes('duplicate')) {
      return { error: 'Este nome gera um link já em uso. Altere o nome comercial e tente de novo.' }
    }
    if (profileError.code === '42501' || msg.toLowerCase().includes('row-level security')) {
      return {
        error:
          'Permissão negada ao atualizar o perfil (RLS). Verifique as políticas da tabela profiles no Supabase.',
      }
    }
    return { error: `Erro ao concluir o cadastro: ${msg || profileError.code}` }
  }

  const defaultWorkingHours = [
    { day_of_week: 1, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 2, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 3, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 4, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 5, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 6, start_time: '09:00', end_time: '13:00' },
  ]

  const { error: whError } = await supabase.from('working_hours').insert(
    defaultWorkingHours.map((wh) => ({
      ...wh,
      professional_id: user.id,
      is_active: true,
    })),
  )

  if (whError) {
    return {
      error: `Erro ao criar horários de trabalho: ${whError.message}. Confirme a migration working_hours no Supabase.`,
    }
  }

  const trialEnds = new Date()
  trialEnds.setDate(trialEnds.getDate() + 3)

  const { error: subError } = await supabase.from('subscriptions').upsert(
    {
      professional_id: user.id,
      plan: 'professional',
      status: 'trial',
      trial_ends_at: trialEnds.toISOString(),
      monthly_price_cents: 4990,
    },
    { onConflict: 'professional_id' },
  )

  if (subError) {
    return { error: `Perfil atualizado, mas falhou a assinatura trial: ${subError.message}` }
  }

  return { success: true, redirect: '/dashboard' }
}
