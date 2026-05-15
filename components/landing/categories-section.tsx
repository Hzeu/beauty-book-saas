'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PROFESSIONAL_CATEGORIES } from '@/lib/constants'

const categories = [
  { key: 'manicure', image: '/categories/manicure.jpg' },
  { key: 'nail_designer', image: '/categories/nail-designer.jpg' },
  { key: 'cabeleireira', image: '/categories/cabeleireira.jpg' },
  { key: 'barbeiro', image: '/categories/barbeiro.jpg' },
  { key: 'lash_designer', image: '/categories/lash.jpg' },
  { key: 'estetica', image: '/categories/estetica.jpg' },
] as const

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-wide"
          >
            Para Todos os Profissionais
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Feito para sua especialidade
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Seja você manicure, cabeleireira, barbeiro ou qualquer outro profissional 
            de beleza, o BeautyBook se adapta às suas necessidades.
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const info = PROFESSIONAL_CATEGORIES[category.key]
            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={`/auth/register?category=${category.key}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                    
                    {/* Category Info */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-4">
                      <span className="text-3xl mb-2">{info.icon}</span>
                      <h3 className="text-white font-semibold">{info.label}</h3>
                      <div className="flex items-center gap-1 text-white/80 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Começar</span>
                        <ArrowRight className="size-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
