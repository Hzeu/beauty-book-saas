import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="size-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Algo deu errado</h1>
        <p className="text-muted-foreground mb-8">
          Não foi possível completar a autenticação. Por favor, tente novamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/auth/login">Fazer login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Voltar para início</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
