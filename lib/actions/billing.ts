'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Fluxo demo: marca assinatura como ativa e registra pagamento. Substituir por gateway (Stripe) em produção. */
export async function activateSubscriptionDemo() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, slug, category')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.category) redirect('/onboarding')

  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      trial_ends_at: null,
    })
    .eq('professional_id', profile.id)

  await supabase.from('payments').insert({
    professional_id: profile.id,
    amount_cents: 4990,
    currency: 'BRL',
    status: 'paid',
    description: 'Plano Profissional — ativação demo',
    paid_at: now.toISOString(),
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/assinatura')
  redirect('/dashboard')
}
