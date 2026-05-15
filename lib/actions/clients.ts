'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ClientActionState = { error?: string; success?: boolean }

export async function createClientAction(
  _prev: ClientActionState | undefined,
  formData: FormData,
): Promise<ClientActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!name || !phone) {
    return { error: 'Nome e telefone são obrigatórios.' }
  }

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('id, slug, category')
    .eq('id', user.id)
    .maybeSingle()

  if (!ownerProfile?.category) {
    return { error: 'Complete o onboarding antes de cadastrar clientes.' }
  }

  const { error } = await supabase.from('clients').insert({
    professional_id: ownerProfile.id,
    name,
    phone,
    email,
    notes,
  })

  if (error) {
    return { error: error.message || 'Não foi possível salvar o cliente.' }
  }

  revalidatePath('/dashboard/clientes')
  redirect('/dashboard/clientes')
}
