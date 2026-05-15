import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { activateSubscriptionDemo } from '@/lib/actions/billing'

export default async function AssinaturaPage() {
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

  const { data: subscription } = onboarded && profile
    ? await supabase
        .from('subscriptions')
        .select('status, trial_ends_at, current_period_end, monthly_price_cents')
        .eq('professional_id', profile.id)
        .maybeSingle()
    : { data: null }

  const price =
    subscription?.monthly_price_cents != null
      ? (subscription.monthly_price_cents / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : 'R$ 49,90'

  return (
    <>
      <DashboardHeader title="Assinatura" description="Plano Profissional" />
      <main className="p-6 max-w-lg space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Situação: </span>
              <span className="font-medium">{subscription?.status ?? '—'}</span>
            </p>
            {subscription?.trial_ends_at && (
              <p>
                <span className="text-muted-foreground">Trial até: </span>
                {new Date(subscription.trial_ends_at).toLocaleString('pt-BR')}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Valor: </span>
              {price}/mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pagamento (demo)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Em produção, conecte um gateway (ex.: Stripe). Aqui você pode simular a ativação após
              pagamento aprovado.
            </p>
            <form action={activateSubscriptionDemo}>
              <Button type="submit" className="w-full">
                Simular pagamento e ativar
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
