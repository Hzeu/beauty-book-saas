'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/client'
import { formatTime, formatCurrency } from '@/lib/helpers'
import { APPOINTMENT_STATUS, DAYS_OF_WEEK } from '@/lib/constants'
import type { Appointment, Service, Client, WorkingHours } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { NewAppointmentDialog } from './new-appointment-dialog'

interface AgendaContentProps {
  professionalId: string
  services: Pick<Service, 'id' | 'name' | 'duration_minutes' | 'price'>[]
  clients: Pick<Client, 'id' | 'name' | 'phone'>[]
  workingHours: WorkingHours[]
}

export function AgendaContent({ 
  professionalId, 
  services, 
  clients,
  workingHours 
}: AgendaContentProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadAppointments() {
      setIsLoading(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(name, phone),
          service:services(name, duration_minutes)
        `)
        .eq('professional_id', professionalId)
        .eq('appointment_date', dateStr)
        .order('start_time', { ascending: true })

      setAppointments(data || [])
      setIsLoading(false)
    }

    loadAppointments()
  }, [selectedDate, professionalId])

  // Get week days
  const weekStart = startOfWeek(selectedDate, { locale: ptBR })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Get working hours for the selected day
  const dayOfWeek = selectedDate.getDay()
  const todayWorkingHours = workingHours.find(wh => wh.day_of_week === dayOfWeek)

  // Generate time slots
  const timeSlots = []
  if (todayWorkingHours) {
    const [startH, startM] = todayWorkingHours.start_time.split(':').map(Number)
    const [endH, endM] = todayWorkingHours.end_time.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    for (let m = startMinutes; m < endMinutes; m += 30) {
      const h = Math.floor(m / 60)
      const mins = m % 60
      timeSlots.push(`${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`)
    }
  }

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(a => {
      const start = a.start_time.slice(0, 5)
      const end = a.end_time.slice(0, 5)
      return time >= start && time < end
    })
  }

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'canceled': return 'bg-red-500'
      case 'no_show': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(d => addDays(d, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px]">
                <CalendarIcon className="mr-2 size-4" />
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(d => addDays(d, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>

          {!isToday(selectedDate) && (
            <Button variant="ghost" onClick={() => setSelectedDate(new Date())}>
              Hoje
            </Button>
          )}
        </div>

        <NewAppointmentDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          services={services}
          clients={clients}
          selectedDate={format(selectedDate, 'yyyy-MM-dd')}
        />
      </div>

      {/* Week Days */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const dayInfo = DAYS_OF_WEEK[day.getDay()]
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[72px] h-20 rounded-xl border transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50',
                isToday(day) && !isSelected && 'border-primary'
              )}
            >
              <span className="text-xs font-medium opacity-70">{dayInfo.short}</span>
              <span className="text-2xl font-bold">{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>

      {/* Day View */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {todayWorkingHours ? (
              <>Horário: {formatTime(todayWorkingHours.start_time)} - {formatTime(todayWorkingHours.end_time)}</>
            ) : (
              'Dia não configurado para atendimento'
            )}
          </CardTitle>
          <Badge variant="secondary">
            {appointments.filter(a => a.status !== 'canceled').length} agendamento(s)
          </Badge>
        </CardHeader>
        <CardContent>
          {!todayWorkingHours ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Você não configurou horário de atendimento para este dia.</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/dashboard/horarios">Configurar horários</Link>
              </Button>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum horário disponível.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((time, index) => {
                const appointment = getAppointmentForSlot(time)
                const isSlotStart = appointment?.start_time.slice(0, 5) === time

                if (appointment && !isSlotStart) return null

                return (
                  <div
                    key={time}
                    className={cn(
                      'flex items-stretch gap-4 min-h-[60px]',
                      !appointment && 'hover:bg-accent/50 rounded-lg cursor-pointer'
                    )}
                    onClick={() => !appointment && setIsDialogOpen(true)}
                  >
                    {/* Time */}
                    <div className="w-16 flex-shrink-0 text-sm text-muted-foreground py-2">
                      {time}
                    </div>

                    {/* Slot */}
                    {appointment ? (
                      <div
                        className={cn(
                          'flex-1 rounded-lg p-3 border-l-4',
                          appointment.status === 'canceled' ? 'opacity-50' : '',
                          getStatusColor(appointment.status)
                        )}
                        style={{
                          backgroundColor: `color-mix(in srgb, ${
                            appointment.status === 'pending' ? '#eab308' :
                            appointment.status === 'confirmed' ? '#3b82f6' :
                            appointment.status === 'completed' ? '#22c55e' :
                            appointment.status === 'canceled' ? '#ef4444' : '#6b7280'
                          } 15%, transparent)`,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{appointment.client?.name || 'Cliente'}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.service?.name} • {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {APPOINTMENT_STATUS[appointment.status].label}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              {formatCurrency(appointment.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                        <Plus className="size-4 mr-1" />
                        Horário livre
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
