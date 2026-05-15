import { notFound } from 'next/navigation'
import { RESERVED_PUBLIC_SLUGS } from '@/lib/constants'
import { loadPublicAvailability } from '@/lib/actions/bookings'
import { PublicBookingForm } from '@/components/public/public-booking-form'

function todayYmd() {
  return new Date().toISOString().slice(0, 10)
}

export default async function PublicProfessionalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: raw } = await params
  const slug = raw.toLowerCase()

  if (RESERVED_PUBLIC_SLUGS.has(slug)) {
    notFound()
  }

  const day = todayYmd()
  const loaded = await loadPublicAvailability(slug, day)
  if (loaded.error || !loaded.data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <PublicBookingForm slug={slug} initialDay={day} initial={loaded.data} />
    </div>
  )
}
