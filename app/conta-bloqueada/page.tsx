'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'

export default function ContaBloqueadaPage() {
  const router = useRouter()
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Conta bloqueada</h1>
      <p className="mt-3 text-muted-foreground text-sm">
        Sua conta foi suspensa. Entre em contato com o suporte para mais informações.
      </p>
      <div className="mt-8 flex flex-col gap-3 w-full">
        <Button
          variant="outline"
          onClick={async () => {
            await signOut()
            router.push('/')
            router.refresh()
          }}
        >
          Sair
        </Button>
        <Button asChild variant="ghost">
          <Link href="mailto:suporte@beautybook.com.br">Enviar email ao suporte</Link>
        </Button>
      </div>
    </div>
  )
}
