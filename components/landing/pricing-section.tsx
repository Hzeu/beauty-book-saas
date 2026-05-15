'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  'Agendamentos ilimitados',
  'Página pública de agendamento',
  'Gestão de clientes e serviços',
  'Lembretes por email',
  'Relatórios essenciais',
  'Suporte por email',
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 lg:py-24 bg-muted/25 border-y border-border/60">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
          >
            Preço simples
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Um plano. Tudo que você precisa.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-muted-foreground max-w-xl mx-auto"
          >
            Teste grátis por 3 dias. Sem cartão de crédito para começar.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5" />
                Plano Profissional
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-md">
                Agenda online, clientes e relatórios em um painel limpo e fácil de usar.
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-4xl font-bold tracking-tight">R$ 49,90</p>
              <p className="text-sm text-muted-foreground">por mês</p>
            </div>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button size="lg" className="w-full mt-10" asChild>
            <Link href="/auth/register">Começar Agora</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
