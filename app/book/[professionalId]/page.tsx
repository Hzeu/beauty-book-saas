import { notFound } from 'next/navigation'
import { loadPublicAvailability, resolvePublicBookingSlug } from '@/lib/actions/bookings'
import { PublicBookingForm } from '@/components/public/public-booking-form'

export const dynamic = 'force-dynamic'

type BookByProfessionalPageProps = {
  params: Promise<{ professionalId: string }>
}

export default async function BookByProfessionalPage({ params }: BookByProfessionalPageProps) {
  const { professionalId } = await params
  const resolved = await resolvePublicBookingSlug(professionalId)

  if (!resolved.slug) {
    notFound()
  }

  const day = new Date().toISOString().slice(0, 10)
  const loaded = await loadPublicAvailability(resolved.slug, day)

  if (loaded.error || !loaded.data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <PublicBookingForm slug={resolved.slug} initialDay={day} initial={loaded.data} />
    </div>
  )
}
