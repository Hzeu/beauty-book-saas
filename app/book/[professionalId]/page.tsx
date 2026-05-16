import { notFound, redirect } from 'next/navigation'
import { resolvePublicBookingSlug } from '@/lib/actions/bookings'

type BookByProfessionalPageProps = {
  params: Promise<{ professionalId: string }>
}

export default async function BookByProfessionalPage({ params }: BookByProfessionalPageProps) {
  const { professionalId } = await params
  const resolved = await resolvePublicBookingSlug(professionalId)

  if (!resolved.slug) {
    notFound()
  }

  redirect(`/${resolved.slug}`)
}
