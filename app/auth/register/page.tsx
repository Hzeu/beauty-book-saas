'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp, type AuthActionResult } from '@/lib/actions/auth'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)

  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthActionResult | undefined, formData: FormData) => signUp(_prev, formData),
    undefined,
  )

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state?.error])

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Verifique seu email</h1>
          <p className="text-muted-foreground mb-8">
            Enviamos um link de confirmação para o seu email. Clique no link para ativar sua conta e
            começar a usar o BeautyBook.
          </p>
          <Button asChild>
            <Link href="/auth/login">Ir para login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-muted/25 border-r border-border items-center justify-center p-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold mb-6">Comece com o BeautyBook</h2>
          <ul className="space-y-4">
            {[
              'Agenda online para seus clientes',
              'Gestão de clientes e serviços',
              'Relatórios essenciais',
              'Plano único: R$ 49,90/mês após 3 dias grátis',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center">
                  <CheckCircle2 className="size-4 text-primary" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="size-4" />
            Voltar para início
          </Link>

          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">BeautyBook</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
            <p className="mt-2 text-muted-foreground">3 dias grátis para testar. Sem cartão de crédito.</p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="Seu nome"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <input type="hidden" name="role" value="professional" />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Criar conta
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao criar sua conta, você concorda com nossos{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
