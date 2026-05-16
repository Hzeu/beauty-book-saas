'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createAppointment } from '@/lib/actions/appointments'
import { formatCurrency, formatDuration } from '@/lib/helpers'
import { TIME_SLOTS } from '@/lib/constants'
import type { Service, Client } from '@/lib/types/database'
import { toast } from 'sonner'

interface NewAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  services: Pick<Service, 'id' | 'name' | 'duration_minutes' | 'price'>[]
  clients: Pick<Client, 'id' | 'name' | 'phone'>[]
  selectedDate: string
}

export function NewAppointmentDialog({
  open,
  onOpenChange,
  services,
  clients,
  selectedDate,
}: NewAppointmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<string>('')
  const router = useRouter()

  const service = services.find(s => s.id === selectedService)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await createAppointment(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Agendamento criado com sucesso!')
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      console.error('[appointments] createAppointment client failure', error)
      toast.error(
        error instanceof Error
          ? `Erro inesperado ao criar agendamento: ${error.message}`
          : 'Erro inesperado ao criar agendamento.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Agende manualmente um atendimento para um cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <Select name="clientId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum cliente cadastrado
                    </div>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Service */}
            <div className="space-y-2">
              <Label htmlFor="serviceId">Serviço *</Label>
              <Select 
                name="serviceId" 
                required
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum serviço cadastrado
                    </div>
                  ) : (
                    services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - {formatCurrency(s.price)} ({formatDuration(s.duration_minutes)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={selectedDate}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Horário *</Label>
                <Select name="startTime" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Service Info */}
            {service && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between text-sm">
                  <span>Duração:</span>
                  <span className="font-medium">{formatDuration(service.duration_minutes)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Valor:</span>
                  <span className="font-medium">{formatCurrency(service.price)}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Alguma observação sobre o atendimento..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || clients.length === 0 || services.length === 0}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
