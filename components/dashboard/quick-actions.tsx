'use client'

import Link from 'next/link'
import { Plus, Calendar, Users, Scissors, Share2, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { buildPublicBookingUrl } from '@/lib/utils/public-booking-url'

interface DashboardQuickActionsProps {
  professionalId: string
  professionalSlug: string
  /** Origem pública (ex.: https://seudominio.com) vinda do servidor — evita mismatch de hidratação. */
  bookingBaseUrl: string
}

export function DashboardQuickActions({
  professionalId,
  professionalSlug,
  bookingBaseUrl,
}: DashboardQuickActionsProps) {
  const bookingUrl = buildPublicBookingUrl(bookingBaseUrl, professionalSlug, professionalId)

  const copyLink = () => {
    if (!bookingUrl) {
      toast.error('Salve seu perfil para gerar o link de agendamento.')
      return
    }
    void navigator.clipboard.writeText(bookingUrl)
    toast.success('Link copiado!')
  }

  const quickActions = [
    {
      title: 'Novo Agendamento',
      description: 'Agendar manualmente',
      icon: Calendar,
      href: '/dashboard/agenda',
      primary: true,
    },
    {
      title: 'Novo Cliente',
      description: 'Cadastrar cliente',
      icon: Users,
      href: '/dashboard/clientes/novo',
    },
    {
      title: 'Novo Serviço',
      description: 'Adicionar serviço',
      icon: Scissors,
      href: '/dashboard/servicos',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant={action.primary ? 'default' : 'outline'}
              className="w-full justify-start"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="mr-2 size-4" />
                <div className="flex-1 text-left">
                  <span className="block">{action.title}</span>
                </div>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Share Booking Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="size-4" />
            Link de Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Compartilhe seu link para clientes agendarem online
          </p>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
            <code className="flex-1 truncate">
              {bookingUrl || '—'}
            </code>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={copyLink}
              disabled={!bookingUrl}
            >
              <Copy className="mr-2 size-4" />
              Copiar
            </Button>
            {bookingUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled aria-label="Link indisponível">
                <ExternalLink className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Dica do dia</h4>
          <p className="text-sm text-muted-foreground">
            Compartilhe seu link de agendamento nas redes sociais para atrair mais clientes!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
