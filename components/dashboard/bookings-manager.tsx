'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { BookingRow, BookingStatus } from '@/lib/types/database'
import { setBookingStatus } from '@/lib/actions/bookings'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

export function BookingsManager({ rows }: { rows: BookingRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function act(id: string, status: BookingStatus) {
    startTransition(async () => {
      const r = await setBookingStatus(id, status)
      if (r.error) toast.error(r.error)
      else {
        toast.success('Atualizado.')
        router.refresh()
      }
    })
  }

  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-8 text-center">
        Nenhuma reserva pela página pública ainda. Compartilhe seu link com clientes.
      </p>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data / hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="whitespace-nowrap text-sm">
                {format(new Date(b.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </TableCell>
              <TableCell className="font-medium">{b.client_name}</TableCell>
              <TableCell className="text-sm">{b.client_phone}</TableCell>
              <TableCell>{b.service}</TableCell>
              <TableCell>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{b.status}</span>
              </TableCell>
              <TableCell className="text-right space-x-1">
                {b.status === 'pending' && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      disabled={pending}
                      onClick={() => act(b.id, 'confirmed')}
                    >
                      {pending ? <Loader2 className="size-4 animate-spin" /> : 'Confirmar'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => act(b.id, 'cancelled')}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
                {b.status === 'confirmed' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => act(b.id, 'cancelled')}
                  >
                    Cancelar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
