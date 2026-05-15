'use server'

import { createClient } from '@/lib/supabase/server'
import { getOwnerScopeId } from '@/lib/supabase/owner-scope'
import { revalidatePath } from 'next/cache'

export type ServiceActionResult = {
  success?: boolean
  error?: string
  data?: unknown
}

async function getProfessionalId(): Promise<string | null> {
  return getOwnerScopeId()
}

export async function createService(formData: FormData): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const durationMinutes = parseInt(formData.get('duration') as string)
  const categoryId = formData.get('categoryId') as string

  if (!name || !price || !durationMinutes) {
    return { error: 'Por favor, preencha os campos obrigatórios.' }
  }

  const { error } = await supabase
    .from('services')
    .insert({
      professional_id: professionalId,
      name,
      description: description || null,
      price,
      duration_minutes: durationMinutes,
      category_id: categoryId || null,
    })

  if (error) {
    return { error: 'Erro ao criar serviço.' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

export async function updateService(id: string, formData: FormData): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const durationMinutes = parseInt(formData.get('duration') as string)
  const isActive = formData.get('isActive') === 'true'

  const { error } = await supabase
    .from('services')
    .update({
      name,
      description: description || null,
      price,
      duration_minutes: durationMinutes,
      is_active: isActive,
    })
    .eq('id', id)
    .eq('professional_id', professionalId)

  if (error) {
    return { error: 'Erro ao atualizar serviço.' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

export async function deleteService(id: string): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('professional_id', professionalId)

  if (error) {
    return { error: 'Erro ao excluir serviço.' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

export async function toggleServiceActive(id: string, isActive: boolean): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('professional_id', professionalId)

  if (error) {
    return { error: 'Erro ao atualizar serviço.' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

export async function createServiceCategory(formData: FormData): Promise<ServiceActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    return { error: 'Por favor, informe o nome da categoria.' }
  }

  const { error } = await supabase
    .from('service_categories')
    .insert({
      professional_id: professionalId,
      name,
      description: description || null,
    })

  if (error) {
    return { error: 'Erro ao criar categoria.' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}
