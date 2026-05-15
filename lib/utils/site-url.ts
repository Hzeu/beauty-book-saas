import { headers } from 'next/headers'

/** Base URL for redirects (email links, OAuth). Uses request headers when NEXT_PUBLIC_SITE_URL is not set. */
export async function getSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'

  if (host) {
    return `${proto}://${host}`
  }

  return 'http://localhost:3000'
}

export function safeInternalPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return fallback
  }
  return next
}
