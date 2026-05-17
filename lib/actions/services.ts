'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const SERVICE_SELECT = '*'

export type ServiceActionResult = {
  success?: boolean
  error?: string
  data?: unknown
}

type SupabaseActionError = {
  message?: string
  details?: string | null
  hint?: string | null
  code?: string
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

type ServiceFormData = {
  name: string
  description: string | null
  price: number
  duration_minutes: number
  category_id: string | null
}

type ParsedServiceForm =
  | { success: true; data: ServiceFormData }
  | { success: false; error: string }

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function formatSupabaseError(error: SupabaseActionError): string {
  return [
    error.message,
    error.details ? `Detalhes: ${error.details}` : null,
    error.hint ? `Dica: ${error.hint}` : null,
    error.code ? `Código: ${error.code}` : null,
  ]
    .filter(Boolean)
    .join(' | ')
}

function logSupabaseError(context: string, error: SupabaseActionError, payload?: unknown) {
  console.error(`[services] ${context}`, {
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    },
    payload,
  })
}

async function getAuthenticatedProfessionalId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    logSupabaseError('auth.getUser failed', error)
    return null
  }

  return user?.id ?? null
}

function parseServiceForm(formData: FormData): ParsedServiceForm {
  const name = getFormString(formData, 'name')
  const description = getFormString(formData, 'description')
  const rawPrice = getFormString(formData, 'price').replace(',', '.')
  const rawDuration = getFormString(formData, 'duration')
  const categoryId = getFormString(formData, 'categoryId')
  const price = Number(rawPrice)
  const durationMinutes = Number.parseInt(rawDuration, 10)

  if (!name) {
    return { success: false, error: 'Informe o nome do serviço.' }
  }

  if (!Number.isFinite(price) || price < 0) {
    return { success: false, error: 'Informe um preço válido.' }
  }

  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    return { success: false, error: 'Informe uma duração válida.' }
  }

  return {
    success: true,
    data: {
      name,
      description: description || null,
      price,
      duration_minutes: durationMinutes,
      category_id: categoryId && categoryId !== 'none' ? categoryId : null,
    },
  }
}

export async function createService(formData: FormData): Promise<ServiceActionResult> {
  try {
    const supabase = await createClient()
    const professionalId = await getAuthenticatedProfessionalId(supabase)

    if (!professionalId) {
      return { error: 'Usuário autenticado não encontrado. Faça login novamente.' }
    }

    const parsed = parseServiceForm(formData)

    if (!parsed.success) {
      return { error: parsed.error }
    }

    const payload = {
      professional_id: professionalId,
      ...parsed.data,
    }

    const { data, error } = await supabase
      .from('services')
      .insert(payload)
      .select(SERVICE_SELECT)
      .single()

    if (error) {
      logSupabaseError('createService insert failed', error, payload)
      return { error: `Erro ao criar serviço: ${formatSupabaseError(error)}` }
    }

    revalidatePath('/dashboard/servicos')
    return { success: true, data }
  } catch (error) {
    console.error('[services] createService unexpected failure', error)
    return {
      error:
        error instanceof Error
          ? `Erro inesperado ao criar serviço: ${error.message}`
          : 'Erro inesperado ao criar serviço.',
    }
  }
}

export async function updateService(id: string, formData: FormData): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getAuthenticatedProfessionalId(supabase)

  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const parsed = parseServiceForm(formData)

  if (!parsed.success) {
    return { error: parsed.error }
  }

  const { data, error } = await supabase
    .from('services')
    .update(parsed.data)
    .eq('id', id)
    .eq('professional_id', professionalId)
    .select(SERVICE_SELECT)
    .single()

  if (error) {
    logSupabaseError('updateService update failed', error, { id, professionalId, ...parsed.data })
    return { error: `Erro ao atualizar serviço: ${formatSupabaseError(error)}` }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true, data }
}

export async function deleteService(id: string): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getAuthenticatedProfessionalId(supabase)

  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('professional_id', professionalId)

  if (error) {
    logSupabaseError('deleteService delete failed', error, { id, professionalId })
    return { error: `Erro ao excluir serviço: ${formatSupabaseError(error)}` }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

export async function toggleServiceActive(id: string, isActive: boolean): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getAuthenticatedProfessionalId(supabase)

  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const { data, error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('professional_id', professionalId)
    .select(SERVICE_SELECT)
    .single()

  if (error) {
    logSupabaseError('toggleServiceActive update failed', error, { id, professionalId, isActive })
    return { error: `Erro ao atualizar serviço: ${formatSupabaseError(error)}` }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true, data }
}

export async function createServiceCategory(formData: FormData): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getAuthenticatedProfessionalId(supabase)

  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const name = getFormString(formData, 'name')
  const description = getFormString(formData, 'description')

  if (!name) {
    return { error: 'Por favor, informe o nome da categoria.' }
  }

  const payload = {
    professional_id: professionalId,
    name,
    description: description || null,
  }

  const { error } = await supabase.from('service_categories').insert(payload)

  if (error) {
    logSupabaseError('createServiceCategory insert failed', error, payload)
    return { error: `Erro ao criar categoria: ${formatSupabaseError(error)}` }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}
