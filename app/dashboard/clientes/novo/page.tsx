'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardHeader } from '@/components/dashboard/header'
import { createClientAction, type ClientActionState } from '@/lib/actions/clients'
import { toast } from 'sonner'

export default function NovoClientePage() {
  const [state, formAction, pending] = useActionState(
    async (prev: ClientActionState | undefined, fd: FormData) => createClientAction(prev, fd),
    undefined,
  )

  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state?.error])

  return (
    <>
      <DashboardHeader title="Novo cliente" description="Cadastro rápido na sua base">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/clientes">
            <ArrowLeft className="mr-2 size-4" />
            Voltar
          </Link>
        </Button>
      </DashboardHeader>
      <main className="p-6 max-w-lg">
        <form action={formAction} className="space-y-4 rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required placeholder="Nome do cliente" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input id="phone" name="phone" required placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input id="email" name="email" type="email" placeholder="email@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input id="notes" name="notes" placeholder="Preferências, alergias..." />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salvar cliente
          </Button>
        </form>
      </main>
    </>
  )
}
