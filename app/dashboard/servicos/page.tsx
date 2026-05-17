import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { ServicesContent } from '@/components/dashboard/services/services-content'
import { listMyServices } from '@/lib/actions/services'

export const dynamic = 'force-dynamic'

export default async function ServicosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { services, categories } = await listMyServices()

  return (
    <>
      <DashboardHeader 
        title="Serviços"
        description="Gerencie os serviços que você oferece"
      />
      
      <main className="p-6">
        <ServicesContent 
          services={services || []} 
          categories={categories || []} 
        />
      </main>
    </>
  )
}
