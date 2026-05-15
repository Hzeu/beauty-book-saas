'use client'

import { useState } from 'react'
import { Calendar, Clock, User, MoreVertical, CheckCircle2, XCircle, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { APPOINTMENT_STATUS } from '@/lib/constants'
import { formatTime, formatCurrency } from '@/lib/helpers'
import type { Appointment } from '@/lib/types/database'
import { cn } from '@/lib/utils'

interface DashboardAppointmentsProps {
  appointments: Appointment[]
}

export function DashboardAppointments({ appointments }: DashboardAppointmentsProps) {
  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = APPOINTMENT_STATUS[status]
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          'capitalize',
          status === 'pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          status === 'confirmed' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          status === 'canceled' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          status === 'no_show' && 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        )}
      >
        {statusConfig.label}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5" />
          Agendamentos de Hoje
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/agenda">Ver agenda completa</a>
        </Button>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum agendamento para hoje</p>
            <Button variant="link" asChild className="mt-2">
              <a href="/dashboard/agenda">Ver outros dias</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Time */}
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatTime(appointment.start_time)}</p>
                    <p className="text-xs text-muted-foreground">
                      até {formatTime(appointment.end_time)}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-12 w-px bg-border" />

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{appointment.client?.name || 'Cliente'}</p>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service?.name || 'Serviço'} • {formatCurrency(appointment.price)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {appointment.client?.phone && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`https://wa.me/55${appointment.client.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <Phone className="size-4" />
                      </a>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {appointment.status === 'pending' && (
                        <DropdownMenuItem>
                          <CheckCircle2 className="mr-2 size-4" />
                          Confirmar
                        </DropdownMenuItem>
                      )}
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <>
                          <DropdownMenuItem>
                            <CheckCircle2 className="mr-2 size-4" />
                            Marcar como concluído
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="mr-2 size-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem>
                        <User className="mr-2 size-4" />
                        Ver cliente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
