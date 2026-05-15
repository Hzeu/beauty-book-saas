'use client'

import { useActionState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/providers/auth-provider'
import { updateProfileSettings, type SettingsState } from '@/lib/actions/settings'
import { toast } from 'sonner'

export default function ConfiguracoesPage() {
  const { profile, refreshProfile } = useAuth()

  const [state, formAction, pending] = useActionState(
    async (prev: SettingsState | undefined, fd: FormData) => updateProfileSettings(prev, fd),
    undefined,
  )

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) {
      toast.success('Perfil atualizado.')
      void refreshProfile()
    }
  }, [state, refreshProfile])

  return (
    <>
      <DashboardHeader title="Configurações" description="Dados da sua conta" />
      <main className="p-6 max-w-lg">
        <form action={formAction} className="space-y-4 rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              placeholder="Seu nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone ?? ''} placeholder="WhatsApp" />
          </div>
          <p className="text-xs text-muted-foreground">Email da conta: {profile?.email}</p>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salvar alterações
          </Button>
        </form>
      </main>
    </>
  )
}
