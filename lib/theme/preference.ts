export type ThemePreference = 'light' | 'dark' | 'system'

export function parseThemePreference(
  raw: string | null | undefined,
  fallback: ThemePreference,
): ThemePreference {
  if (raw === 'dark' || raw === 'light' || raw === 'system') return raw
  return fallback
}

export function resolvePreference(
  pref: ThemePreference,
  prefersDark: boolean,
): 'light' | 'dark' {
  if (pref === 'dark') return 'dark'
  if (pref === 'light') return 'light'
  return prefersDark ? 'dark' : 'light'
}

/** Preferência `system` + hint opcional do Client Hint `Sec-CH-Prefers-Color-Scheme`. */
export function resolveForServer(
  pref: ThemePreference,
  secChPrefersColorScheme: string | null | undefined,
): 'light' | 'dark' {
  if (pref === 'dark') return 'dark'
  if (pref === 'light') return 'light'
  return secChPrefersColorScheme === 'dark' ? 'dark' : 'light'
}
