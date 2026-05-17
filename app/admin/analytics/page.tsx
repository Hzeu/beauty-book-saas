import { Ban, ShieldCheck, UserCog, Users } from 'lucide-react'
import { AdminStatCard } from '@/components/admin/admin-stat-card'
import { loadAdminCounts } from '@/lib/admin/users'

export default async function AdminAnalyticsPage() {
  const counts = await loadAdminCounts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Basic platform health and user distribution.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Total users" value={counts.totalUsers} icon={Users} />
        <AdminStatCard title="Professionals" value={counts.totalProfessionals} icon={UserCog} />
        <AdminStatCard title="Blocked accounts" value={counts.blockedAccounts} icon={Ban} />
        <AdminStatCard title="Admins" value={counts.totalAdmins} icon={ShieldCheck} />
      </div>
    </div>
  )
}
