import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSubscriptionAccessBlocked } from '@/lib/billing/subscription-gate'
import type { UserRole } from '@/lib/types/database'

type SessionProfile = {
  role: UserRole
  is_blocked?: boolean | null
  category?: string | null
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  return NextResponse.redirect(url)
}

function destinationForRole(role: UserRole | null | undefined) {
  if (role === 'admin') return '/admin'
  if (role === 'professional') return '/dashboard'
  return '/'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  const protectedRoutes = ['/dashboard', '/admin', '/settings', '/onboarding', '/auth/update-password']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  let profile: SessionProfile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, is_blocked, category')
      .eq('id', user.id)
      .maybeSingle()
    profile = data as SessionProfile | null
  }

  if (user && !profile) {
    if (isProtectedRoute) {
      return redirectTo(request, '/auth/login')
    }
    return supabaseResponse
  }

  if (user && profile?.is_blocked === true && !path.startsWith('/blocked')) {
    return redirectTo(request, '/blocked')
  }

  if (isAuthRoute && user && profile) {
    return redirectTo(request, destinationForRole(profile?.role))
  }

  if (path.startsWith('/admin') && user && profile?.role !== 'admin') {
    return redirectTo(request, '/dashboard')
  }

  if (path.startsWith('/dashboard') && user) {
    if (profile?.role === 'admin') {
      return redirectTo(request, '/admin')
    }

    if (profile?.role !== 'professional') {
      return redirectTo(request, '/')
    }

    if (profile?.role === 'professional' && !path.startsWith('/dashboard/assinatura')) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, trial_ends_at, current_period_end')
        .eq('professional_id', user.id)
        .maybeSingle()

      if (subscription && isSubscriptionAccessBlocked(subscription)) {
        return redirectTo(request, '/dashboard/assinatura')
      }
    }
  }

  if (path.startsWith('/onboarding') && user && profile?.role !== 'professional') {
    return redirectTo(request, destinationForRole(profile?.role))
  }

  return supabaseResponse
}
