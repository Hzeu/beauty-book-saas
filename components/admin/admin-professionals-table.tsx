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
import type { AdminProfessionalRow } from '@/lib/admin/users'

async function adminDispatchVoid(formData: FormData) {
  'use server'
  await adminDispatchForm(formData)
}

export function AdminProfessionalsTable({ professionals }: { professionals: AdminProfessionalRow[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Professional</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Clients</TableHead>
            <TableHead>Last subscription activity</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {professionals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-zinc-500">
                No professional accounts found.
              </TableCell>
            </TableRow>
          ) : (
            professionals.map((professional) => (
              <TableRow key={professional.id}>
                <TableCell>
                  <p className="font-medium">{professional.full_name?.trim() || 'Unnamed professional'}</p>
                  <p className="text-xs text-zinc-500">{professional.email}</p>
                </TableCell>
                <TableCell>{professional.plan ?? 'none'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={professional.subscription_status === 'active' ? 'default' : 'secondary'}>
                      {professional.subscription_status ?? 'no subscription'}
                    </Badge>
                    {professional.is_blocked ? <Badge variant="destructive">blocked</Badge> : null}
                  </div>
                </TableCell>
                <TableCell className="font-medium tabular-nums">{professional.clients_count}</TableCell>
                <TableCell className="text-xs text-zinc-500">
                  {professional.subscription_updated_at
                    ? new Date(professional.subscription_updated_at).toLocaleDateString('pt-BR')
                    : 'no activity'}
                </TableCell>
                <TableCell className="text-xs text-zinc-500">
                  {new Date(professional.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <form action={adminDispatchVoid}>
                    <input
                      type="hidden"
                      name="intent"
                      value={professional.is_blocked ? 'unblock_profile' : 'block_profile'}
                    />
                    <input type="hidden" name="profileId" value={professional.id} />
                    <Button type="submit" size="sm" variant={professional.is_blocked ? 'outline' : 'destructive'}>
                      {professional.is_blocked ? 'Unblock' : 'Block'}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
