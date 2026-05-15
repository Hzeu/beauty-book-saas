import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { ServicesContent } from '@/components/dashboard/services/services-content'

export default async function ServicosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const ownerId = user?.id ?? ''

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('professional_id', ownerId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .eq('professional_id', ownerId)
    .order('display_order', { ascending: true })

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
