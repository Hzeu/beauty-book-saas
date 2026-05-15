import { createClient } from '@/lib/supabase/server'

export default async function AdminHomePage() {
  const supabase = await createClient()

  const [{ count: users }, { count: pros }, { count: appts }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Visão geral</h1>
        <p className="text-muted-foreground text-sm">Métricas do sistema (tempo real via Supabase)</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Perfis</p>
          <p className="text-3xl font-semibold tabular-nums">{users ?? '—'}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Contas profissionais (role)</p>
          <p className="text-3xl font-semibold tabular-nums">{pros ?? '—'}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Agendamentos</p>
          <p className="text-3xl font-semibold tabular-nums">{appts ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
