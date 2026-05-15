import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if professional has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, slug, category')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'professional' && !profile.category) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-16 lg:pl-64 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}
