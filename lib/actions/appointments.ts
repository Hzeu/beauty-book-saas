'use server'

import { createClient } from '@/lib/supabase/server'
import { getOwnerScopeId } from '@/lib/supabase/owner-scope'
import { revalidatePath } from 'next/cache'
import type { AppointmentStatus } from '@/lib/types/database'

export type AppointmentActionResult = {
  success?: boolean
  error?: string
  data?: unknown
}

async function getProfessionalId(): Promise<string | null> {
  return getOwnerScopeId()
}

export async function createAppointment(formData: FormData): Promise<AppointmentActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const clientId = formData.get('clientId') as string
  const serviceId = formData.get('serviceId') as string
  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const notes = formData.get('notes') as string

  if (!clientId || !serviceId || !date || !startTime) {
    return { error: 'Por favor, preencha os campos obrigatórios.' }
  }

  // Get service details for duration and price
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes, price')
    .eq('id', serviceId)
    .single()

  if (!service) {
    return { error: 'Serviço não encontrado.' }
  }

  // Calculate end time
  const [hours, minutes] = startTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + service.duration_minutes
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

  // Check for conflicts
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('appointment_date', date)
    .neq('status', 'canceled')
    .or(`start_time.lt.${endTime},end_time.gt.${startTime}`)
    .limit(1)

  if (conflicts && conflicts.length > 0) {
    return { error: 'Já existe um agendamento neste horário.' }
  }

  const { error } = await supabase
    .from('appointments')
    .insert({
      professional_id: professionalId,
      client_id: clientId,
      service_id: serviceId,
      appointment_date: date,
      start_time: startTime,
      end_time: endTime,
      price: service.price,
      notes: notes || null,
      status: 'pending',
    })

  if (error) {
    return { error: 'Erro ao criar agendamento.' }
  }

  revalidatePath('/dashboard/agenda')
  return { success: true }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<AppointmentActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
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
    return { error: 'Erro ao atualizar status.' }
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelAppointment(
  id: string,
  reason?: string
): Promise<AppointmentActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  const { data: { user } } = await supabase.auth.getUser()

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
    return { error: 'Erro ao cancelar agendamento.' }
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newStartTime: string
): Promise<AppointmentActionResult> {
  const supabase = await createClient()
  const professionalId = await getProfessionalId()
  
  if (!professionalId) {
    return { error: 'Profissional não encontrado.' }
  }

  // Get the appointment to get service duration
  const { data: appointment } = await supabase
    .from('appointments')
    .select('service_id, services(duration_minutes)')
    .eq('id', id)
    .single()

  if (!appointment) {
    return { error: 'Agendamento não encontrado.' }
  }

  const duration = (appointment.services as { duration_minutes: number })?.duration_minutes || 60

  // Calculate new end time
  const [hours, minutes] = newStartTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + duration
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  const newEndTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

  // Check for conflicts
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('appointment_date', newDate)
    .neq('status', 'canceled')
    .neq('id', id)
    .or(`start_time.lt.${newEndTime},end_time.gt.${newStartTime}`)
    .limit(1)

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
    return { error: 'Erro ao reagendar.' }
  }

  revalidatePath('/dashboard/agenda')
  return { success: true }
}
