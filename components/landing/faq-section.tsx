'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'Como funciona o período de teste gratuito?',
    answer: 'Você tem 3 dias para testar o BeautyBook com acesso completo. Não pedimos cartão de crédito para começar. Após o período, continue com o Plano Profissional (R$ 49,90/mês) para manter todos os recursos.',
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas. Seu acesso continuará ativo até o final do período já pago. Todos os seus dados ficam disponíveis para exportação.',
  },
  {
    question: 'Como meus clientes fazem agendamento?',
    answer: 'Você recebe um link personalizado (ex: beautybook.com.br/seu-nome) que pode compartilhar nas redes sociais, WhatsApp ou onde preferir. Seus clientes acessam, veem seus serviços, horários disponíveis e agendam em poucos cliques.',
  },
  {
    question: 'O sistema envia lembretes automáticos?',
    answer: 'Sim! Enviamos lembretes automáticos por email 24h e 1h antes do agendamento. Em breve: lembretes por WhatsApp para reduzir faltas.',
  },
  {
    question: 'Posso personalizar minha página de agendamento?',
    answer: 'Claro! Você pode adicionar sua foto, logo, descrição, cores personalizadas e muito mais. Sua página fica com a cara do seu negócio, profissional e atraente para seus clientes.',
  },
  {
    question: 'O BeautyBook funciona no celular?',
    answer: 'Sim! O sistema é 100% responsivo e funciona perfeitamente em celulares, tablets e computadores. Você pode gerenciar sua agenda de qualquer lugar, a qualquer hora.',
  },
  {
    question: 'Como funciona o suporte?',
    answer: 'Suporte por email em até 24h úteis no Plano Profissional. Use também a área de ajuda dentro do painel quando precisar.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Absolutamente! Utilizamos criptografia de ponta a ponta, servidores seguros e seguimos todas as normas da LGPD. Seus dados e de seus clientes estão protegidos com os mais altos padrões de segurança.',
  },
]

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-medium pr-8">{question}</span>
        <ChevronDown
          className={cn(
            'size-5 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-wide"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Perguntas Frequentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Tire suas dúvidas sobre o BeautyBook
          </motion.p>
        </div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6 sm:p-8"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
