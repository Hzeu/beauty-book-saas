// Application constants

export const APP_NAME = 'BeautyBook'
export const APP_DESCRIPTION = 'Sistema de agendamento online para profissionais de beleza'

/** Rotas internas que não devem ser tratadas como slug público de profissional */
export const RESERVED_PUBLIC_SLUGS = new Set([
  'auth',
  'admin',
  'dashboard',
  'onboarding',
  'api',
  'settings',
  'conta-bloqueada',
  '_next',
  'favicon.ico',
  'login',
])

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Básico',
    price: 29.90,
    features: [
      'Até 50 agendamentos/mês',
      'Página pública de agendamento',
      'Gestão de serviços',
      'Notificações por email',
      'Suporte por email',
    ],
    limits: {
      appointments: 50,
      services: 10,
      clients: 100,
    },
  },
  professional: {
    name: 'Profissional',
    price: 59.90,
    features: [
      'Agendamentos ilimitados',
      'Página personalizada',
      'Relatórios completos',
      'Sistema de fidelidade',
      'Cupons de desconto',
      'Suporte prioritário',
    ],
    limits: {
      appointments: Infinity,
      services: 50,
      clients: 500,
    },
  },
  premium: {
    name: 'Premium',
    price: 99.90,
    features: [
      'Tudo do Profissional',
      'Multi profissionais',
      'Integração WhatsApp',
      'Google Calendar Sync',
      'API personalizada',
      'Suporte 24/7',
    ],
    limits: {
      appointments: Infinity,
      services: Infinity,
      clients: Infinity,
    },
  },
} as const

// Professional Categories
export const PROFESSIONAL_CATEGORIES = {
  manicure: { label: 'Manicure', icon: '💅' },
  nail_designer: { label: 'Nail Designer', icon: '✨' },
  cabeleireira: { label: 'Cabeleireira', icon: '💇‍♀️' },
  barbeiro: { label: 'Barbeiro', icon: '💈' },
  lash_designer: { label: 'Lash Designer', icon: '👁️' },
  estetica: { label: 'Estética', icon: '🧖‍♀️' },
  outros: { label: 'Outros', icon: '✂️' },
} as const

// Days of week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
] as const

// Appointment Status
export const APPOINTMENT_STATUS = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500' },
  completed: { label: 'Concluído', color: 'bg-green-500' },
  canceled: { label: 'Cancelado', color: 'bg-red-500' },
  no_show: { label: 'Não compareceu', color: 'bg-gray-500' },
} as const

// Ticket Status
export const TICKET_STATUS = {
  open: { label: 'Aberto', color: 'bg-yellow-500' },
  in_progress: { label: 'Em andamento', color: 'bg-blue-500' },
  answered: { label: 'Respondido', color: 'bg-green-500' },
  closed: { label: 'Fechado', color: 'bg-gray-500' },
} as const

// Time slots (15 minute intervals)
export const TIME_SLOTS = Array.from({ length: 57 }, (_, i) => {
  const hours = Math.floor((i * 15 + 420) / 60) // Start at 7:00
  const minutes = (i * 15 + 420) % 60
  return {
    value: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    label: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
  }
})

// Theme colors for professionals
export const THEME_COLORS = [
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Dourado', value: '#eab308' },
  { name: 'Ciano', value: '#06b6d4' },
] as const

// Brazilian states
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const
