import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { AgendaContent } from '@/components/dashboard/agenda/agenda-content'

export default async function AgendaPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const ownerId = user?.id ?? ''

  // Get services for the dropdown
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price')
    .eq('professional_id', ownerId)
    .eq('is_active', true)
    .order('name')

  // Get clients for the dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('professional_id', ownerId)
    .eq('is_active', true)
    .order('name')

  // Get working hours
  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('professional_id', ownerId)
    .eq('is_active', true)

  return (
    <>
      <DashboardHeader 
        title="Agenda"
        description="Visualize e gerencie seus agendamentos"
      />
      
      <main className="p-6">
        <AgendaContent 
          professionalId={ownerId} 
          services={services || []}
          clients={clients || []}
          workingHours={workingHours || []}
        />
      </main>
    </>
  )
}
