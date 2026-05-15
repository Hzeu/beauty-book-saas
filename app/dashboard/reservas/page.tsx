import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { BookingsManager } from '@/components/dashboard/bookings-manager'
import type { BookingRow } from '@/lib/types/database'

export default async function ReservasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: rows } = await supabase
    .from('bookings')
    .select('*')
    .eq('professional_id', user.id)
    .order('date', { ascending: true })

  return (
    <>
      <DashboardHeader
        title="Reservas"
        description="Agendamentos feitos pela sua página pública"
      />
      <main className="p-6">
        <BookingsManager rows={(rows ?? []) as BookingRow[]} />
      </main>
    </>
  )
}
