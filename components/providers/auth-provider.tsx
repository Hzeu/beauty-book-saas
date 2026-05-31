'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_ROLE, normalizeRole } from '@/lib/auth/roles'
import type { Profile, Subscription, SubscriptionPlan, UserRole } from '@/lib/types/database'
import type { Session, User } from '@supabase/supabase-js'

type AuthProfile = Profile & {
  plan: SubscriptionPlan | null
  is_blocked: boolean
}

interface AuthContextType {
  user: User | null
  profile: AuthProfile | null
  subscription: Subscription | null
  role: UserRole
  plan: SubscriptionPlan | null
  isBlocked: boolean
  isLoading: boolean
  isReady: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const activeUserIdRef = useRef<string | null>(null)
  const profileRequestRef = useRef(0)

  const clearAuthState = useCallback(() => {
    activeUserIdRef.current = null
    profileRequestRef.current += 1
    setUser(null)
    setProfile(null)
    setSubscription(null)
  }, [])

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!userId) return

      const requestId = ++profileRequestRef.current
      activeUserIdRef.current = userId

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(
          'id, email, full_name, phone, avatar_url, role, is_active, is_blocked, slug, category, city, state, service_catalog, created_at, updated_at',
        )
        .eq('id', userId)
        .maybeSingle()

      if (activeUserIdRef.current !== userId || profileRequestRef.current !== requestId) {
        return
      }

      if (profileError || !profileData) {
        setProfile(null)
        setSubscription(null)
        return
      }

      const role = normalizeRole(profileData.role)

      if (role === 'professional') {
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('professional_id', userId)
          .maybeSingle()

        if (activeUserIdRef.current !== userId || profileRequestRef.current !== requestId) {
          return
        }

        setSubscription(subscriptionData ?? null)
        setProfile({
          ...profileData,
          role,
          is_blocked: profileData.is_blocked === true,
          plan: subscriptionData?.plan ?? null,
        })
      } else {
        setSubscription(null)
        setProfile({
          ...profileData,
          role,
          is_blocked: profileData.is_blocked === true,
          plan: null,
        })
      }
    },
    [supabase],
  )

  const syncSession = useCallback(
    async (session: Session | null) => {
      const nextUser = session?.user ?? null

      if (!nextUser) {
        clearAuthState()
        return
      }

      setUser(nextUser)
      await fetchProfile(nextUser.id)
    },
    [clearAuthState, fetchProfile],
  )

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return
    await fetchProfile(user.id)
  }, [user, fetchProfile])

  const signOut = useCallback(async () => {
    clearAuthState()
    await supabase.auth.signOut({ scope: 'global' })
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login')
    }
  }, [clearAuthState, supabase])

  useEffect(() => {
    let mounted = true

    const finish = () => {
      if (mounted) setIsLoading(false)
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      void syncSession(session).finally(finish)
    })

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      void syncSession(session).finally(finish)
    })

    return () => {
      mounted = false
      authSub.unsubscribe()
    }
  }, [supabase, syncSession])

  const role: UserRole = profile?.role ?? DEFAULT_ROLE

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      subscription,
      role,
      plan: profile?.plan ?? subscription?.plan ?? null,
      isBlocked: profile?.is_blocked === true,
      isLoading,
      isReady: !isLoading,
      signOut,
      refreshProfile,
    }),
    [user, profile, subscription, role, isLoading, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
