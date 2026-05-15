import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AjudaPage() {
  return (
    <>
      <DashboardHeader title="Ajuda e suporte" description="Estamos aqui para ajudar" />
      <main className="p-6 max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Central de ajuda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Dúvidas sobre agenda, clientes ou assinatura? Envie um email para{' '}
              <a href="mailto:suporte@beautybook.com.br" className="text-primary font-medium">
                suporte@beautybook.com.br
              </a>{' '}
              e responderemos em até 24 horas úteis.
            </p>
            <p>
              Antes de abrir chamado, confira se seu trial ou assinatura está ativo em{' '}
              <Link href="/dashboard/assinatura" className="text-primary underline">
                Assinatura
              </Link>
              .
            </p>
          </CardContent>
        </Card>
        <Button variant="outline" asChild>
          <Link href="/">Voltar ao site</Link>
        </Button>
      </main>
    </>
  )
}
