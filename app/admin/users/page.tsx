import { AdminUsersTable } from '@/components/admin/admin-users-table'
import { loadAdminUsers } from '@/lib/admin/users'

export default async function AdminUsersPage() {
  const users = await loadAdminUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
        <p className="text-sm text-zinc-500">Manage roles, access, blocking and soft deletion across all profiles.</p>
      </div>
      <AdminUsersTable users={users} />
    </div>
  )
}
