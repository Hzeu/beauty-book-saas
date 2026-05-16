import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { WorkingHoursForm } from '@/components/dashboard/working-hours-form'

export default async function HorariosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const ownerId = user?.id ?? ''

  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('professional_id', ownerId)
    .order('day_of_week', { ascending: true })

  return (
    <>
      <DashboardHeader
        title="Horários de atendimento"
        description="Configure os dias e horários em que seus clientes podem agendar"
      />

      <main className="p-6">
        <div className="max-w-4xl">
          <WorkingHoursForm workingHours={workingHours || []} />
        </div>
      </main>
    </>
  )
}
