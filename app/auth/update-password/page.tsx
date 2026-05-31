import { use } from "react"
import { updatePassword } from '@/lib/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Sparkles, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'



export default function UpdatePasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await updatePassword(formData)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Senha atualizada com sucesso.')
    if (result.redirect) {
      router.push(result.redirect)
      router.refresh()
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Nova senha</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Defina uma nova senha para sua conta.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Repita a senha"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salvar nova senha
          </Button>
        </form>
      </div>
    </div>
  )
}
