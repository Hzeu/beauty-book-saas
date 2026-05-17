import { AdminUsersTable } from '@/components/admin/admin-users-table'
import { loadAdminUsers } from '@/lib/admin/users'

export default async function AdminBlockedPage() {
  const users = await loadAdminUsers(undefined, true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Blocked Accounts</h1>
        <p className="text-sm text-zinc-500">Accounts currently blocked from accessing protected areas.</p>
      </div>
      <AdminUsersTable users={users} emptyLabel="No blocked accounts." />
    </div>
  )
}
