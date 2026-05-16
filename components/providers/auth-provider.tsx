'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Subscription } from '@/lib/types/database'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  subscription: Subscription | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profileData) {
        setProfile(null)
        setSubscription(null)
        return
      }

      setProfile(profileData)

      if (profileData.role === 'professional') {
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('professional_id', userId)
          .maybeSingle()

        setSubscription(subscriptionData ?? null)
      } else {
        setSubscription(null)
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
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSubscription(null)
    if (error) console.error('[auth] signOut failed', error)
  }, [supabase])

  useEffect(() => {
    let cancelled = false

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return

      if (event === 'INITIAL_SESSION') {
        const u = session?.user ?? null
        setUser(u)
        if (u) await fetchProfile(u.id)
        setIsLoading(false)
        return
      }

      if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
        return
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
        return
      }

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setSubscription(null)
        return
      }

      if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
    })

    return () => {
      cancelled = true
      authSub.unsubscribe()
    }
  }, [supabase, fetchProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
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
