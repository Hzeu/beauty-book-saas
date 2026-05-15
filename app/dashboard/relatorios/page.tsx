import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RelatoriosPage() {
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

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const startStr = startOfMonth.toISOString().split('T')[0]

  const { data: monthAppointments } = onboarded && profile
    ? await supabase
        .from('appointments')
        .select('id, status, price')
        .eq('professional_id', profile.id)
        .gte('appointment_date', startStr)
    : { data: [] }

  const completed = monthAppointments?.filter((a) => a.status === 'completed') ?? []
  const revenue = completed.reduce((s, a) => s + (a.price || 0), 0)
  const total = monthAppointments?.length ?? 0

  return (
    <>
      <DashboardHeader
        title="Relatórios"
        description="Resumo do mês atual"
      />
      <main className="p-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos (mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita (concluídos)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>
        {!onboarded && (
          <p className="text-sm text-muted-foreground sm:col-span-3">Complete o onboarding para ver relatórios.</p>
        )}
      </main>
    </>
  )
}
