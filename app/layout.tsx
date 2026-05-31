import type { Metadata, Viewport } from 'next'
import { cookies, headers } from 'next/headers'
import { Geist, Geist_Mono } from 'next/font/google'

import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'
import { parseThemePreference, resolveForServer } from '@/lib/theme/preference'
import './globals.css'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'BeautyBook - Agendamento Online para Profissionais de Beleza',
    template: '%s | BeautyBook',
  },
  description: 'Sistema completo de agendamento online para manicures, cabeleireiras, barbeiros, lash designers e profissionais de estética. Gerencie sua agenda, clientes e pagamentos em um só lugar.',
  keywords: [
    'agendamento online',
    'salão de beleza',
    'manicure',
    'cabeleireira',
    'barbeiro',
    'lash designer',
    'estética',
    'gestão de salão',
    'agenda online',
    'profissionais de beleza',
  ],
  authors: [{ name: 'BeautyBook' }],
  creator: 'BeautyBook',
  metadataBase: new URL('https://beautybook.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://beautybook.com.br',
    siteName: 'BeautyBook',
    title: 'BeautyBook - Agendamento Online para Profissionais de Beleza',
    description: 'Sistema completo de agendamento online para profissionais de beleza.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BeautyBook',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeautyBook - Agendamento Online para Profissionais de Beleza',
    description: 'Sistema completo de agendamento online para profissionais de beleza.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const headerList = await headers()
  const themeCookie = cookieStore.get('theme')?.value ?? null
  const preference = parseThemePreference(themeCookie, 'light')
  const secCh = headerList.get('sec-ch-prefers-color-scheme')
  const resolved = resolveForServer(preference, secCh)

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn('bg-background', resolved === 'dark' && 'dark')}
      style={{ colorScheme: resolved }}
    >
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          cookieTheme={themeCookie}
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          serverPrefersDark={secCh === 'dark'}
        >
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
        
      </body>
    </html>
  )
}
