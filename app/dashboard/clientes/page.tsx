import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ClientesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, slug, category')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  const onboarded = Boolean(profile?.category)

  const { data: clients } = onboarded && profile
    ? await supabase
        .from('clients')
        .select('id, name, phone, email, created_at')
        .eq('professional_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    : { data: null }

  return (
    <>
      <DashboardHeader
        title="Clientes"
        description="Cadastre e gerencie sua base de clientes"
      >
        <Button asChild>
          <Link href="/dashboard/clientes/novo">Novo cliente</Link>
        </Button>
      </DashboardHeader>
      <main className="p-6">
        {!onboarded ? (
          <p className="text-muted-foreground">Complete o onboarding para cadastrar clientes.</p>
        ) : !(clients ?? []).length ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            <p>Nenhum cliente ainda.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/clientes/novo">Adicionar primeiro cliente</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Desde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(clients ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.email ?? '—'}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  )
}
