'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const stats = [
  { value: '10k+', label: 'Profissionais' },
  { value: '500k+', label: 'Agendamentos' },
  { value: '4.9', label: 'Avaliação', icon: Star },
  { value: '99.9%', label: 'Uptime' },
]

const highlights = ['Sem cartão de crédito', '3 dias grátis', 'Cancele quando quiser']

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs font-medium">
              Agendamento online para profissionais de beleza
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance"
          >
            Sua agenda de beleza,{' '}
            <span className="text-primary">organizada</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance"
          >
            Gerencie clientes, horários e serviços em um painel claro. Link público para seus clientes
            agendarem quando quiserem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/auth/register">
                Começar Agora
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/auth/login">Já tenho conta</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-16 lg:mt-20"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center rounded-xl border border-border/80 bg-card/50 py-5 px-3">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-semibold tabular-nums">{stat.value}</span>
                  {stat.icon && <stat.icon className="size-4 text-amber-500 fill-amber-500" />}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mt-14 lg:mt-16"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden max-w-5xl mx-auto">
            <div className="aspect-[16/10] bg-muted/40 p-4 sm:p-8">
              <div className="h-full rounded-xl border border-border bg-background p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-28 bg-muted rounded" />
                      <div className="h-2.5 w-20 bg-muted/70 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-muted rounded-md" />
                    <div className="h-8 w-8 bg-muted rounded-md" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/30">
                      <div className="h-2.5 w-12 bg-muted rounded mb-2" />
                      <div className="h-5 w-16 bg-muted rounded" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-md border border-border/40 ${
                        i % 11 === 0 ? 'bg-primary/15 border-primary/25' : 'bg-muted/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
