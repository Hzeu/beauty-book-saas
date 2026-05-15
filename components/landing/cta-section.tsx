'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border bg-card p-8 sm:p-10 text-center shadow-sm"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
            Pronto para organizar sua agenda?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            BeautyBook reúne agendamentos, clientes e serviços em um só lugar. Teste 3 dias grátis,
            sem cartão de crédito.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/auth/register">
                Começar Agora
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/auth/login">Entrar</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
