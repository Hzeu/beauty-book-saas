'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Loader2, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/actions/auth'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await resetPassword(formData)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setSent(true)
    toast.success('Se o email existir, você receberá um link para redefinir a senha.')
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verifique seu email</h1>
          <p className="mt-3 text-muted-foreground text-sm">
            Enviamos instruções para redefinir sua senha. Abra o link no mesmo navegador em que você usa o BeautyBook.
          </p>
          <Button asChild className="mt-8">
            <Link href="/auth/login">Voltar ao login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="size-4" />
          Voltar ao login
        </Link>

        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">BeautyBook</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Esqueceu a senha?</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Informe seu email e enviaremos um link para criar uma nova senha.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Enviar link
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Lembrou da senha?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
