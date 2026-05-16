'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AppointmentStatus } from '@/lib/types/database'

export type AppointmentActionResult = {
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
  console.error(`[appointments] ${context}`, {
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    },
    payload,
  })
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function addMinutesToTime(startTime: string, durationMinutes: number): string | null {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + durationMinutes

  if (endMinutes > 24 * 60) return null

  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
}

async function getAuthenticatedProfessionalId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
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

export async function createAppointment(formData: FormData): Promise<AppointmentActionResult> {
  const supabase = await createClient()
  const professionalId = await getAuthenticatedProfessionalId(supabase)

  if (!professionalId) {
    return { error: 'Usuário autenticado não encontrado. Faça login novamente.' }
  }

  const clientId = getFormString(formData, 'clientId')
  const serviceId = getFormString(formData, 'serviceId')
  const date = getFormString(formData, 'date')
  const startTime = getFormString(formData, 'startTime')
  const notes = getFormString(formData, 'notes')

  if (!clientId || !serviceId || !date || !startTime) {
    return { error: 'Por favor, preencha os campos obrigatórios.' }
  }

  if (!isValidDate(date) || !isValidTime(startTime)) {
    return { error: 'Informe data e horário válidos.' }
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('professional_id', professionalId)
    .maybeSingle()

  if (clientError) {
    logSupabaseError('createAppointment client lookup failed', clientError, { clientId, professionalId })
    return { error: `Erro ao validar cliente: ${formatSupabaseError(clientError)}` }
  }

  if (!client) {
    return { error: 'Cliente não encontrado para este profissional.' }
  }

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, duration_minutes, price')
    .eq('id', serviceId)
    .eq('professional_id', professionalId)
    .eq('is_active', true)
    .maybeSingle()

  if (serviceError) {
    logSupabaseError('createAppointment service lookup failed', serviceError, { serviceId, professionalId })
    return { error: `Erro ao validar serviço: ${formatSupabaseError(serviceError)}` }
  }

  if (!service) {
    return { error: 'Serviço não encontrado para este profissional.' }
  }

  const endTime = addMinutesToTime(startTime, service.duration_minutes)

  if (!endTime) {
    return { error: 'O horário escolhido ultrapassa o fim do dia.' }
  }

  const { data: conflicts, error: conflictError } = await supabase
    .from('appointments')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('appointment_date', date)
    .neq('status', 'canceled')
    .lt('start_time', endTime)
    .gt('end_time', startTime)
    .limit(1)

  if (conflictError) {
    logSupabaseError('createAppointment conflict lookup failed', conflictError, {
      professionalId,
      date,
      startTime,
      endTime,
    })
    return { error: `Erro ao verificar agenda: ${formatSupabaseError(conflictError)}` }
  }

  if (conflicts && conflicts.length > 0) {
    return { error: 'Já existe um agendamento neste horário.' }
  }

  const payload = {
    professional_id: professionalId,
    client_id: clientId,
    service_id: serviceId,
    appointment_date: date,
    start_time: startTime,
    end_time: endTime,
    price: service.price,
    notes: notes || null,
    status: 'pending' as AppointmentStatus,
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    logSupabaseError('createAppointment insert failed', error, payload)
    return { error: `Erro ao criar agendamento: ${formatSupabaseError(error)}` }
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentActionResult> {
  const supabase = await createClient()
  const professionalId = await getAuthenticatedProfessionalId(supabase)

  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const updates: Record<string, unknown> = { status }

  if (status === 'confirmed') {
    updates.confirmed_at = new Date().toISOString()
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  } else if (status === 'canceled') {
    updates.canceled_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .eq('professional_id', professionalId)

  if (error) {
    logSupabaseError('updateAppointmentStatus update failed', error, { id, professionalId, status })
    return { error: `Erro ao atualizar status: ${formatSupabaseError(error)}` }
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelAppointment(id: string, reason?: string): Promise<AppointmentActionResult> {
  const supabase = await createClient()
  const professionalId = await getAuthenticatedProfessionalId(supabase)

  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      canceled_by: user?.id,
      cancellation_reason: reason || null,
    })
    .eq('id', id)
    .eq('professional_id', professionalId)

  if (error) {
    logSupabaseError('cancelAppointment update failed', error, { id, professionalId })
    return { error: `Erro ao cancelar agendamento: ${formatSupabaseError(error)}` }
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newStartTime: string,
): Promise<AppointmentActionResult> {
  const supabase = await createClient()
  const professionalId = await getAuthenticatedProfessionalId(supabase)

  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  if (!isValidDate(newDate) || !isValidTime(newStartTime)) {
    return { error: 'Informe data e horário válidos.' }
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select('id, service_id')
    .eq('id', id)
    .eq('professional_id', professionalId)
    .maybeSingle()

  if (appointmentError) {
    logSupabaseError('rescheduleAppointment lookup failed', appointmentError, { id, professionalId })
    return { error: `Erro ao buscar agendamento: ${formatSupabaseError(appointmentError)}` }
  }

  if (!appointment) {
    return { error: 'Agendamento não encontrado.' }
  }

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', appointment.service_id)
    .eq('professional_id', professionalId)
    .maybeSingle()

  if (serviceError) {
    logSupabaseError('rescheduleAppointment service lookup failed', serviceError, {
      serviceId: appointment.service_id,
      professionalId,
    })
    return { error: `Erro ao buscar serviço: ${formatSupabaseError(serviceError)}` }
  }

  const newEndTime = addMinutesToTime(newStartTime, service?.duration_minutes ?? 60)

  if (!newEndTime) {
    return { error: 'O horário escolhido ultrapassa o fim do dia.' }
  }

  const { data: conflicts, error: conflictError } = await supabase
    .from('appointments')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('appointment_date', newDate)
    .neq('status', 'canceled')
    .neq('id', id)
    .lt('start_time', newEndTime)
    .gt('end_time', newStartTime)
    .limit(1)

  if (conflictError) {
    logSupabaseError('rescheduleAppointment conflict lookup failed', conflictError, {
      id,
      professionalId,
      newDate,
      newStartTime,
      newEndTime,
    })
    return { error: `Erro ao verificar agenda: ${formatSupabaseError(conflictError)}` }
  }

  if (conflicts && conflicts.length > 0) {
    return { error: 'Já existe um agendamento neste horário.' }
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      appointment_date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
      status: 'pending',
    })
    .eq('id', id)
    .eq('professional_id', professionalId)

  if (error) {
    logSupabaseError('rescheduleAppointment update failed', error, { id, professionalId })
    return { error: `Erro ao reagendar: ${formatSupabaseError(error)}` }
  }

  revalidatePath('/dashboard/agenda')
  return { success: true }
}
