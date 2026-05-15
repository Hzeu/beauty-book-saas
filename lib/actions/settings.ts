'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SettingsState = { error?: string; success?: boolean }

export async function updateProfileSettings(
  _prev: SettingsState | undefined,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const full_name = (formData.get('full_name') as string)?.trim()
  const phoneRaw = (formData.get('phone') as string)?.trim()

  const patch: Record<string, string | null> = {}
  if (full_name) patch.full_name = full_name
  if (phoneRaw !== undefined) patch.phone = phoneRaw || null

  if (Object.keys(patch).length === 0) {
    return { error: 'Informe ao menos um campo para atualizar.' }
  }

  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/configuracoes')
  return { success: true }
}
