import type { UserRole } from '@/lib/types/database'

export const DEFAULT_ROLE: UserRole = 'client'

export function normalizeRole(role: unknown): UserRole {
  if (role === 'admin' || role === 'professional' || role === 'client') {
    return role
  }
  return DEFAULT_ROLE
}

export function destinationForRole(role: UserRole | null | undefined) {
  if (role === 'admin') return '/admin'
  if (role === 'professional') return '/dashboard'
  return '/'
}

export function isRedirectAllowedForRole(path: string, role: UserRole | null | undefined) {
  if (!path) return false
  if (path.startsWith('/admin')) return role === 'admin'
  if (path.startsWith('/dashboard')) return role === 'professional'
  if (path.startsWith('/onboarding')) return role === 'professional'
  return true
}
