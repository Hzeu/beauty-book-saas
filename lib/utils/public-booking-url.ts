/**
 * Caminho público de agendamento (sem origem).
 * Preferência: /{slug} — rota canônica em app/[slug]/page.tsx
 * Fallback: /book/{id} — app/book/[professionalId]/page.tsx
 */
export function getPublicBookingPath(
  slug: string | null | undefined,
  professionalId?: string | null,
): string {
  const normalizedSlug = slug?.trim()
  if (normalizedSlug) {
    return `/${normalizedSlug}`
  }

  const id = professionalId?.trim()
  if (id) {
    return `/book/${id}`
  }

  return ''
}

/** URL completa para compartilhar (origem + caminho). */
export function buildPublicBookingUrl(
  baseUrl: string,
  slug: string | null | undefined,
  professionalId?: string | null,
): string {
  const base = baseUrl.replace(/\/$/, '')
  const path = getPublicBookingPath(slug, professionalId)
  return path ? `${base}${path}` : ''
}
