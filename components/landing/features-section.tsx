'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  CreditCard,
  Users,
  BarChart3,
  Bell,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Clock,
  MessageSquare,
  Star,
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Calendário completo com visualização diária, semanal e mensal. Bloqueie horários e gerencie pausas facilmente.',
  },
  {
    icon: Globe,
    title: 'Página de Agendamento',
    description: 'Link personalizado para seus clientes agendarem online 24/7, sem precisar de ligações ou mensagens.',
  },
  {
    icon: Users,
    title: 'Gestão de Clientes',
    description: 'Base completa de clientes com histórico de atendimentos, preferências e dados de contato.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Detalhados',
    description: 'Dashboard com métricas de faturamento, serviços mais vendidos e análise de desempenho.',
  },
  {
    icon: Bell,
    title: 'Notificações Automáticas',
    description: 'Lembretes por email e WhatsApp para reduzir faltas e manter seus clientes informados.',
  },
  {
    icon: CreditCard,
    title: 'Pagamentos Online',
    description: 'Integração com PIX, cartões e boleto. Receba antecipado ou após o atendimento.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Sistema 100% responsivo. Gerencie sua agenda de qualquer lugar pelo celular.',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Seus dados e de seus clientes protegidos com criptografia de ponta a ponta.',
  },
  {
    icon: Zap,
    title: 'Super Rápido',
    description: 'Interface otimizada para velocidade. Agendamentos em segundos, não minutos.',
  },
  {
    icon: Clock,
    title: 'Disponibilidade 24/7',
    description: 'Seu cliente pode agendar a qualquer hora, mesmo quando você está descansando.',
  },
  {
    icon: MessageSquare,
    title: 'Suporte Humanizado',
    description: 'Time de suporte pronto para ajudar você a ter sucesso com a plataforma.',
  },
  {
    icon: Star,
    title: 'Avaliações e Fidelidade',
    description: 'Colete feedback dos clientes e crie programas de pontos e cupons de desconto.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-wide"
          >
            Recursos Completos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Tudo que você precisa para crescer
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Uma plataforma completa para gerenciar seu negócio de beleza, 
            desde o agendamento até o pagamento.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
