'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Maria Oliveira',
    role: 'Nail Designer',
    image: '/testimonials/maria.jpg',
    content: 'O BeautyBook transformou meu negócio! Antes eu perdia horas organizando agenda pelo WhatsApp. Agora minhas clientes agendam sozinhas e eu posso focar no que amo fazer.',
    rating: 5,
  },
  {
    name: 'Juliana Santos',
    role: 'Cabeleireira',
    image: '/testimonials/juliana.jpg',
    content: 'Aumentei meu faturamento em 40% depois que comecei a usar. Os lembretes automáticos reduziram muito as faltas dos clientes. Super recomendo!',
    rating: 5,
  },
  {
    name: 'Carlos Silva',
    role: 'Barbeiro',
    image: '/testimonials/carlos.jpg',
    content: 'Sistema simples e direto ao ponto. Meus clientes adoram poder agendar online a qualquer hora. O suporte é excelente também!',
    rating: 5,
  },
  {
    name: 'Amanda Costa',
    role: 'Lash Designer',
    image: '/testimonials/amanda.jpg',
    content: 'Finalmente um sistema feito para profissionais de beleza! Entende nossas necessidades e tem recursos que outros apps não têm.',
    rating: 5,
  },
  {
    name: 'Fernanda Lima',
    role: 'Esteticista',
    image: '/testimonials/fernanda.jpg',
    content: 'O programa de fidelidade fez minhas clientes voltarem mais vezes. A gestão financeira me ajuda a entender melhor meu negócio.',
    rating: 5,
  },
  {
    name: 'Patricia Mendes',
    role: 'Manicure',
    image: '/testimonials/patricia.jpg',
    content: 'Uso há 1 ano e não troco por nada. A página de agendamento é linda e profissional. Minhas clientes sempre elogiam!',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-wide"
          >
            Depoimentos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Amado por milhares de profissionais
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Veja o que nossos clientes falam sobre usar o BeautyBook no dia a dia.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              className="relative p-6 rounded-2xl border border-border bg-card"
            >
              <Quote className="absolute top-6 right-6 size-8 text-primary/10" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed">
                {testimonial.content}
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
