import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSubscriptionAccessBlocked } from '@/lib/billing/subscription-gate'

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

  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/settings',
    '/onboarding',
    '/auth/update-password',
  ]
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  if (user && path.startsWith('/dashboard')) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

    const blocked = profile && 'is_blocked' in profile && (profile as { is_blocked?: boolean }).is_blocked === true
    if (blocked) {
      const url = request.nextUrl.clone()
      url.pathname = '/conta-bloqueada'
      return NextResponse.redirect(url)
    }

    if (profile?.role === 'professional' && !path.startsWith('/dashboard/assinatura')) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, trial_ends_at, current_period_end')
        .eq('professional_id', user.id)
        .maybeSingle()

      if (subscription && isSubscriptionAccessBlocked(subscription)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/assinatura'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
