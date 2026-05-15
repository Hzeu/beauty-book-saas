import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount_cents, currency, status, description, paid_at, created_at, professional_id')
    .order('created_at', { ascending: false })
    .limit(100)

  const profIds = [...new Set((payments ?? []).map((p) => p.professional_id))]
  const { data: pros } =
    profIds.length > 0
      ? await supabase.from('profiles').select('id, full_name, email').in('id', profIds)
      : { data: [] }
  const profName = new Map(pros?.map((p) => [p.id, p.full_name?.trim() || p.email]) ?? [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <p className="text-sm text-muted-foreground">Registros registrados no sistema</p>
      </div>
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(payments ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Nenhum pagamento registrado.
                </TableCell>
              </TableRow>
            ) : (
              (payments ?? []).map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(pay.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{profName.get(pay.professional_id) ?? pay.professional_id}</TableCell>
                  <TableCell>
                    {(pay.amount_cents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: pay.currency || 'BRL',
                    })}
                  </TableCell>
                  <TableCell>{pay.status}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                    {pay.description ?? '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
