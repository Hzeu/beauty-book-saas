import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/auth/roles'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_blocked, email, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/auth/login')

  if (profile.is_blocked === true) {
    redirect('/blocked')
  }

  if (normalizeRole(profile.role) !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <AdminSidebar />
      <div className="pl-72">
        <AdminHeader profile={profile} />
        <main className="mx-auto w-full max-w-7xl p-8">{children}</main>
      </div>
    </div>
  )
}
