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
import type { Profile, Subscription, SubscriptionPlan } from '@/lib/types/database'
import type { User } from '@supabase/supabase-js'

type AuthProfile = Profile & {
  plan: SubscriptionPlan | null
  is_blocked: boolean
}

interface AuthContextType {
  user: User | null
  profile: AuthProfile | null
  subscription: Subscription | null
  role: Profile['role'] | null
  plan: SubscriptionPlan | null
  isBlocked: boolean
  isLoading: boolean
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
      const requestId = ++profileRequestRef.current
      activeUserIdRef.current = userId
      setProfile(null)
      setSubscription(null)

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

      if (profileData.role === 'professional') {
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
          is_blocked: profileData.is_blocked === true,
          plan: subscriptionData?.plan ?? null,
        })
      } else {
        setSubscription(null)
        setProfile({
          ...profileData,
          is_blocked: profileData.is_blocked === true,
          plan: null,
        })
      }
    },
    [supabase],
  )

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    clearAuthState()
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    clearAuthState()
    setIsLoading(false)
    if (error) console.error('[auth] signOut failed', error)
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login')
    }
  }, [clearAuthState, supabase])

  useEffect(() => {
    let cancelled = false

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return

      if (event === 'INITIAL_SESSION') {
        const u = session?.user ?? null
        clearAuthState()
        setUser(u)
        if (u) await fetchProfile(u.id)
        setIsLoading(false)
        return
      }

      if (event === 'TOKEN_REFRESHED' && session?.user) {
        activeUserIdRef.current = session.user.id
        setUser(session.user)
        await fetchProfile(session.user.id)
        setIsLoading(false)
        return
      }

      if (event === 'SIGNED_IN' && session?.user) {
        clearAuthState()
        setUser(session.user)
        await fetchProfile(session.user.id)
        setIsLoading(false)
        return
      }

      if (event === 'SIGNED_OUT') {
        clearAuthState()
        setIsLoading(false)
        return
      }

      if (event === 'USER_UPDATED' && session?.user) {
        activeUserIdRef.current = session.user.id
        setUser(session.user)
        await fetchProfile(session.user.id)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
      authSub.unsubscribe()
    }
  }, [supabase, fetchProfile, clearAuthState])

  useEffect(() => {
    console.log('AUTH USER', user)
    console.log('PROFILE ROLE', profile?.role)
  }, [user, profile?.role])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        role: profile?.role ?? null,
        plan: profile?.plan ?? subscription?.plan ?? null,
        isBlocked: profile?.is_blocked === true,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
