import { notFound } from 'next/navigation'
import { loadPublicAvailability, resolvePublicBookingProfile } from '@/lib/actions/bookings'
import { PublicBookingForm } from '@/components/public/public-booking-form'
import { PublicBookingUnavailable } from '@/components/public/public-booking-unavailable'

export const dynamic = 'force-dynamic'

type BookByProfessionalPageProps = {
  params: Promise<{ professionalId: string }>
}

export default async function BookByProfessionalPage({ params }: BookByProfessionalPageProps) {
  const { professionalId } = await params
  const rawIdentifier = professionalId?.trim() ?? ''

  if (!rawIdentifier) {
    notFound()
  }

  const resolved = await resolvePublicBookingProfile(rawIdentifier)

  if (!resolved.profile?.slug) {
    return <PublicBookingUnavailable message={resolved.error ?? 'Profissional não encontrado.'} />
  }

  const day = new Date().toISOString().slice(0, 10)
  const loaded = await loadPublicAvailability(resolved.profile.slug, day)

  if (loaded.error || !loaded.data) {
    return (
      <PublicBookingUnavailable
        message={loaded.error ?? 'Este profissional não está disponível para agendamento no momento.'}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <PublicBookingForm slug={loaded.data.profile.slug} initialDay={day} initial={loaded.data} />
    </div>
  )
}
