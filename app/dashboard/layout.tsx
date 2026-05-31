import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/auth/roles'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, slug, category, is_blocked')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/auth/login')
  }

  if (profile.is_blocked === true) {
    redirect('/blocked')
  }

  const role = normalizeRole(profile.role)

  if (role === 'admin') {
    redirect('/admin')
  }

  if (role !== 'professional') {
    redirect('/')
  }

  if (!profile.category) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-16 lg:pl-64 transition-all duration-300">{children}</div>
    </div>
  )
}
