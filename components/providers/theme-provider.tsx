'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  parseThemePreference,
  resolvePreference,
  type ThemePreference,
} from '@/lib/theme/preference'

const COOKIE_NAME = 'theme'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export type AppThemeContext = {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
  resolvedTheme: 'light' | 'dark'
  systemTheme: 'light' | 'dark'
  themes: ThemePreference[]
}

const ThemeContext = React.createContext<AppThemeContext | undefined>(undefined)

function readSystemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyDocumentTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

function disableTransitionsTemporarily(nonce?: string) {
  const css =
    '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
  const style = document.createElement('style')
  if (nonce) style.setAttribute('nonce', nonce)
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)
  return () => {
    void window.getComputedStyle(document.body)
    setTimeout(() => document.head.removeChild(style), 1)
  }
}

function writeThemeCookie(value: ThemePreference) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export type AppThemeProviderProps = {
  children: React.ReactNode
  /** Valor bruto do cookie `theme` (null se ausente). Deve vir do servidor para alinhar hidratação. */
  cookieTheme: string | null
  defaultTheme?: ThemePreference
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  /** Preferência "system" no SSR: alinha com `Sec-CH-Prefers-Color-Scheme` do pedido. */
  serverPrefersDark?: boolean
  /** Reservado para compatibilidade com a API antiga do next-themes (não usado). */
  attribute?: 'class'
}

export function ThemeProvider({
  children,
  cookieTheme,
  defaultTheme = 'light',
  enableSystem = true,
  disableTransitionOnChange = false,
  serverPrefersDark = false,
}: AppThemeProviderProps) {
  const router = useRouter()
  const fallback = defaultTheme

  const [theme, setThemeState] = React.useState<ThemePreference>(() =>
    parseThemePreference(cookieTheme, fallback),
  )

  const systemTheme: 'light' | 'dark' = React.useSyncExternalStore(
    React.useCallback((onStoreChange) => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => onStoreChange()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }, []),
    () => (readSystemPrefersDark() ? 'dark' : 'light'),
    () => (serverPrefersDark ? 'dark' : 'light'),
  )

  const resolvedTheme: 'light' | 'dark' = React.useMemo(
    () => resolvePreference(theme, systemTheme === 'dark'),
    [theme, systemTheme],
  )

  React.useLayoutEffect(() => {
    applyDocumentTheme(resolvedTheme)
  }, [resolvedTheme])

  const themes = React.useMemo(() => {
    return enableSystem ? (['light', 'dark', 'system'] as const) : (['light', 'dark'] as const)
  }, [enableSystem])

  const setTheme = React.useCallback(
    (next: ThemePreference) => {
      const apply = () => {
        setThemeState(next)
        writeThemeCookie(next)
        const resolved = resolvePreference(next, readSystemPrefersDark())
        applyDocumentTheme(resolved)
        router.refresh()
      }
      if (disableTransitionOnChange) {
        const end = disableTransitionsTemporarily()
        apply()
        end()
        return
      }
      apply()
    },
    [disableTransitionOnChange, router],
  )

  const value = React.useMemo<AppThemeContext>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      themes: [...themes],
    }),
    [theme, setTheme, resolvedTheme, systemTheme, themes],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): AppThemeContext {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
