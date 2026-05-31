import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSubscriptionAccessBlocked } from '@/lib/billing/subscription-gate'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/admin',
  '/onboarding',
  '/settings',
  '/auth/update-password',
]

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
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

  if (isProtectedPath(path) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  if (user && isProtectedPath(path) && !path.startsWith('/blocked')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.is_blocked === true) {
      const url = request.nextUrl.clone()
      url.pathname = '/blocked'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  if (
    user &&
    path.startsWith('/dashboard') &&
    !path.startsWith('/dashboard/assinatura')
  ) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at, current_period_end')
      .eq('professional_id', user.id)
      .maybeSingle()

    if (subscription && isSubscriptionAccessBlocked(subscription)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/assinatura'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
