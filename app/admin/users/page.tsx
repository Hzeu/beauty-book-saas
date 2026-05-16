import { createClient } from '@/lib/supabase/server'
import { adminDispatchForm } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

async function adminDispatchVoid(formData: FormData) {
  'use server'
  await adminDispatchForm(formData)
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_blocked, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(80)

  const ids = profiles?.map((p) => p.id) ?? []
  const { data: subscriptions } =
    ids.length > 0
      ? await supabase.from('subscriptions').select('id, professional_id, status').in('professional_id', ids)
      : { data: [] }

  const subByOwner = new Map(subscriptions?.map((s) => [s.professional_id, s]) ?? [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Bloquear / desbloquear, perfil ativo, assinatura (ativo · bloqueado · vencido), encerrar conta.
        </p>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Assinatura</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="min-w-[280px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(profiles ?? []).map((p) => {
              const sub = subByOwner.get(p.id)
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate">{p.email}</TableCell>
                  <TableCell>{p.role}</TableCell>
                  <TableCell>{sub?.status ?? '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {p.is_blocked ? 'Bloq.' : 'Livre'} · {p.is_active ? 'Ativo' : 'Inativo'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <form action={adminDispatchVoid}>
                        <input type="hidden" name="intent" value="block_profile" />
                        <input type="hidden" name="profileId" value={p.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Bloquear
                        </Button>
                      </form>
                      <form action={adminDispatchVoid}>
                        <input type="hidden" name="intent" value="unblock_profile" />
                        <input type="hidden" name="profileId" value={p.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Desbloq.
                        </Button>
                      </form>
                      <form action={adminDispatchVoid}>
                        <input type="hidden" name="intent" value="activate_profile" />
                        <input type="hidden" name="profileId" value={p.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          Perfil on
                        </Button>
                      </form>
                      <form action={adminDispatchVoid}>
                        <input type="hidden" name="intent" value="deactivate_profile" />
                        <input type="hidden" name="profileId" value={p.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          Perfil off
                        </Button>
                      </form>
                      {sub && (
                        <>
                          <form action={adminDispatchVoid}>
                            <input type="hidden" name="intent" value="set_subscription" />
                            <input type="hidden" name="subscriptionId" value={sub.id} />
                            <input type="hidden" name="status" value="active" />
                            <Button type="submit" size="sm" variant="default">
                              Sub ativo
                            </Button>
                          </form>
                          <form action={adminDispatchVoid}>
                            <input type="hidden" name="intent" value="set_subscription" />
                            <input type="hidden" name="subscriptionId" value={sub.id} />
                            <input type="hidden" name="status" value="blocked" />
                            <Button type="submit" size="sm" variant="destructive">
                              Sub bloq.
                            </Button>
                          </form>
                          <form action={adminDispatchVoid}>
                            <input type="hidden" name="intent" value="set_subscription" />
                            <input type="hidden" name="subscriptionId" value={sub.id} />
                            <input type="hidden" name="status" value="expired" />
                            <Button type="submit" size="sm" variant="outline">
                              Sub venc.
                            </Button>
                          </form>
                        </>
                      )}
                      <form action={adminDispatchVoid}>
                        <input type="hidden" name="intent" value="deactivate_account" />
                        <input type="hidden" name="profileId" value={p.id} />
                        <Button type="submit" size="sm" variant="ghost" className="text-destructive">
                          Encerrar
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
