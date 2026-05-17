import { adminDispatchForm } from '@/lib/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SubscriptionPlan, UserRole } from '@/lib/types/database'

export type AdminUserRow = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_blocked: boolean | null
  is_active: boolean | null
  created_at: string
  plan: SubscriptionPlan | null
  subscription_status: string | null
  monthly_price_cents: number | null
}

async function adminDispatchVoid(formData: FormData) {
  'use server'
  await adminDispatchForm(formData)
}

function displayName(user: AdminUserRow) {
  return user.full_name?.trim() || 'No name'
}

export function AdminUsersTable({ users, emptyLabel = 'No users found.' }: { users: AdminUserRow[]; emptyLabel?: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="min-w-[420px]">Admin actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="max-w-[260px]">
                    <p className="truncate font-medium">{displayName(user)}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{user.plan ?? 'none'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.subscription_status ?? 'no subscription'}
                      {user.monthly_price_cents
                        ? ` · ${(user.monthly_price_cents / 100).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}`
                        : ''}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={user.is_blocked ? 'destructive' : 'outline'}>
                      {user.is_blocked ? 'blocked' : 'clear'}
                    </Badge>
                    <Badge variant={user.is_active === false ? 'secondary' : 'outline'}>
                      {user.is_active === false ? 'inactive' : 'active'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={adminDispatchVoid}>
                      <input type="hidden" name="intent" value={user.is_blocked ? 'unblock_profile' : 'block_profile'} />
                      <input type="hidden" name="profileId" value={user.id} />
                      <Button type="submit" size="sm" variant={user.is_blocked ? 'outline' : 'destructive'}>
                        {user.is_blocked ? 'Unblock' : 'Block'}
                      </Button>
                    </form>

                    <form action={adminDispatchVoid} className="flex items-center gap-1">
                      <input type="hidden" name="intent" value="set_role" />
                      <input type="hidden" name="profileId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        aria-label="Change role"
                      >
                        <option value="admin">admin</option>
                        <option value="professional">professional</option>
                        <option value="client">client</option>
                      </select>
                      <Button type="submit" size="sm" variant="outline">
                        Role
                      </Button>
                    </form>

                    <form action={adminDispatchVoid} className="flex items-center gap-1">
                      <input type="hidden" name="intent" value="set_plan" />
                      <input type="hidden" name="profileId" value={user.id} />
                      <select
                        name="plan"
                        defaultValue={user.plan ?? 'professional'}
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        aria-label="Change plan"
                      >
                        <option value="basic">basic</option>
                        <option value="professional">professional</option>
                        <option value="premium">premium</option>
                      </select>
                      <Button type="submit" size="sm" variant="outline">
                        Plan
                      </Button>
                    </form>

                    <form action={adminDispatchVoid}>
                      <input
                        type="hidden"
                        name="intent"
                        value={user.is_active === false ? 'activate_profile' : 'soft_delete_profile'}
                      />
                      <input type="hidden" name="profileId" value={user.id} />
                      <Button type="submit" size="sm" variant="secondary">
                        {user.is_active === false ? 'Activate' : 'Soft delete'}
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
