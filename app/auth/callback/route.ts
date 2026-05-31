import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import {
  destinationForRole,
  isRedirectAllowedForRole,
  normalizeRole,
} from '@/lib/auth/roles'
import { safeInternalPath } from '@/lib/utils/site-url'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeInternalPath(searchParams.get('next'), '')

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error', origin))
  }

  const redirectUrl = new URL('/auth/login', origin)
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/auth/error', origin))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    response.headers.set('Location', new URL('/auth/login', origin).toString())
    return response
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, category, is_blocked')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    response.headers.set('Location', new URL('/auth/login', origin).toString())
    return response
  }

  if (profile.is_blocked === true) {
    response.headers.set('Location', new URL('/blocked', origin).toString())
    return response
  }

  const role = normalizeRole(profile.role)

  if (isRedirectAllowedForRole(next, role)) {
    response.headers.set('Location', new URL(next, origin).toString())
    return response
  }

  if (role === 'professional' && !profile.category) {
    response.headers.set('Location', new URL('/onboarding', origin).toString())
    return response
  }

  response.headers.set('Location', new URL(destinationForRole(role), origin).toString())
  return response
}
