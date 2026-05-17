import { AdminProfessionalsTable } from '@/components/admin/admin-professionals-table'
import { loadAdminProfessionals } from '@/lib/admin/users'

export default async function AdminProfessionalsPage() {
  const professionals = await loadAdminProfessionals()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Professionals</h1>
        <p className="text-sm text-zinc-500">Professional accounts, activity and client ownership.</p>
      </div>
      <AdminProfessionalsTable professionals={professionals} />
    </div>
  )
}
