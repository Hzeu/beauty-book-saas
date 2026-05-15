import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/utils/site-url'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardStats } from '@/components/dashboard/stats'
import { DashboardAppointments } from '@/components/dashboard/appointments'
import { DashboardQuickActions } from '@/components/dashboard/quick-actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const bookingBaseUrl = await getSiteUrl()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const ownerId = user?.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, slug')
    .eq('id', ownerId ?? '')
    .maybeSingle()

  // Get today's appointments
  const today = new Date().toISOString().split('T')[0]
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      service:services(*)
    `)
    .eq('professional_id', ownerId ?? '')
    .eq('appointment_date', today)
    .order('start_time', { ascending: true })

  // Get stats for the current month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { data: monthAppointments } = await supabase
    .from('appointments')
    .select('id, status, price')
    .eq('professional_id', ownerId ?? '')
    .gte('appointment_date', startOfMonth.toISOString().split('T')[0])

  const { data: totalClients } = await supabase
    .from('clients')
    .select('id', { count: 'exact' })
    .eq('professional_id', ownerId ?? '')

  // Calculate stats
  const stats = {
    todayAppointments: todayAppointments?.length || 0,
    monthAppointments: monthAppointments?.length || 0,
    monthRevenue: monthAppointments
      ?.filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.price || 0), 0) || 0,
    totalClients: totalClients?.length || 0,
    pendingAppointments: todayAppointments?.filter(a => a.status === 'pending').length || 0,
  }

  return (
    <>
      <DashboardHeader 
        title={`Olá, ${profile?.full_name || 'Profissional'}!`}
        description="Aqui está um resumo do seu dia"
      />
      
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <DashboardStats stats={stats} />
        
        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <DashboardAppointments appointments={todayAppointments || []} />
          </div>
          
          {/* Quick Actions */}
          <div>
            <DashboardQuickActions
              professionalSlug={profile?.slug || ''}
              bookingBaseUrl={bookingBaseUrl}
            />
          </div>
        </div>
      </main>
    </>
  )
}
