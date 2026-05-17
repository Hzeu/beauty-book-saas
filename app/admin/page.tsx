import { Ban, CircleDollarSign, UserCog, Users } from 'lucide-react'
import { AdminStatCard } from '@/components/admin/admin-stat-card'
import { AdminUsersTable } from '@/components/admin/admin-users-table'
import { loadAdminCounts, loadAdminUsers } from '@/lib/admin/users'

function money(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default async function AdminHomePage() {
  const [counts, recentUsers] = await Promise.all([loadAdminCounts(), loadAdminUsers()])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Master Dashboard</h1>
        <p className="text-sm text-zinc-500">Platform control, access, revenue and operating health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard title="Total users" value={counts.totalUsers} icon={Users} />
        <AdminStatCard title="Professionals" value={counts.totalProfessionals} icon={UserCog} />
        <AdminStatCard title="Clients" value={counts.totalClients} icon={Users} />
        <AdminStatCard title="Blocked accounts" value={counts.blockedAccounts} icon={Ban} />
        <AdminStatCard
          title="Total revenue"
          value={money(counts.totalRevenueCents)}
          description={`${counts.activeSubscriptions} active subscriptions`}
          icon={CircleDollarSign}
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Recent users</h2>
          <p className="text-sm text-zinc-500">Latest profiles created in the system.</p>
        </div>
        <AdminUsersTable users={recentUsers.slice(0, 8)} />
      </section>
    </div>
  )
}
