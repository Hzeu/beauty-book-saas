import { CircleDollarSign, CreditCard, ReceiptText, TriangleAlert } from 'lucide-react'
import { AdminStatCard } from '@/components/admin/admin-stat-card'
import { loadAdminFinance } from '@/lib/admin/users'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

function money(cents: number | null | undefined) {
  return ((cents ?? 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default async function AdminFinancePage() {
  const finance = await loadAdminFinance()
  const totalPlans =
    finance.planDistribution.basic + finance.planDistribution.professional + finance.planDistribution.premium

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
        <p className="text-sm text-zinc-500">Subscription revenue, plan mix and payment health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Total revenue" value={money(finance.totalRevenueCents)} icon={CircleDollarSign} />
        <AdminStatCard title="Active subscriptions" value={finance.activeSubscriptions} icon={CreditCard} />
        <AdminStatCard title="Failed payments" value={finance.failedPayments} icon={TriangleAlert} />
        <AdminStatCard title="Plans assigned" value={totalPlans} icon={ReceiptText} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Plan distribution</h2>
          <div className="mt-5 space-y-4">
            {(['basic', 'professional', 'premium'] as const).map((plan) => {
              const count = finance.planDistribution[plan]
              const percent = totalPlans > 0 ? Math.round((count / totalPlans) * 100) : 0
              return (
                <div key={plan} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{plan}</span>
                    <span className="text-zinc-500">{count} accounts</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-950" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professional</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finance.subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-zinc-500">
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                finance.subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <p className="font-medium">{subscription.professional_name}</p>
                      <p className="text-xs text-zinc-500">{subscription.professional_email}</p>
                    </TableCell>
                    <TableCell>{subscription.plan ?? 'none'}</TableCell>
                    <TableCell>
                      <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                        {subscription.status ?? 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{money(subscription.monthly_price_cents)}</TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {subscription.updated_at
                        ? new Date(subscription.updated_at).toLocaleDateString('pt-BR')
                        : 'never'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
