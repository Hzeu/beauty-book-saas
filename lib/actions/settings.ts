'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SettingsState = { error?: string; success?: boolean }
export type WorkingHoursState = { error?: string; success?: boolean }

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

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

export async function updateWorkingHours(
  _prev: WorkingHoursState | undefined,
  formData: FormData,
): Promise<WorkingHoursState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado.' }

  for (let day = 0; day <= 6; day += 1) {
    const isActive = formData.get(`active_${day}`) === 'on'
    const startTime = getFormString(formData, `start_${day}`)
    const endTime = getFormString(formData, `end_${day}`)

    if (isActive) {
      if (!isValidTime(startTime) || !isValidTime(endTime)) {
        return { error: 'Informe horários válidos para todos os dias ativos.' }
      }

      if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
        return { error: 'O horário inicial deve ser menor que o horário final.' }
      }
    }

    const row = {
      professional_id: user.id,
      day_of_week: day,
      start_time: startTime || '09:00',
      end_time: endTime || '18:00',
      is_active: isActive,
    }

    const { data: existingRows, error: selectError } = await supabase
      .from('working_hours')
      .select('id')
      .eq('professional_id', user.id)
      .eq('day_of_week', day)

    if (selectError) {
      return { error: selectError.message }
    }

    if (existingRows?.length) {
      const { error } = await supabase
        .from('working_hours')
        .update(row)
        .eq('professional_id', user.id)
        .eq('day_of_week', day)

      if (error) return { error: error.message }
    } else {
      const { error } = await supabase.from('working_hours').insert(row)

      if (error) return { error: error.message }
    }
  }

  revalidatePath('/dashboard/horarios')
  revalidatePath('/dashboard/agenda')
  return { success: true }
}
