// Database types for the beauty booking SaaS

export type UserRole = 'client' | 'professional' | 'admin'
export type SubscriptionPlan = 'basic' | 'professional' | 'premium'
export type SubscriptionStatus =
  | 'active'
  | 'trial'
  | 'past_due'
  | 'canceled'
  | 'suspended'
  | 'expired'
  | 'blocked'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'no_show'
export type TicketStatus = 'open' | 'in_progress' | 'answered' | 'closed'
export type ProfessionalCategory = 'manicure' | 'nail_designer' | 'cabeleireira' | 'barbeiro' | 'lash_designer' | 'estetica' | 'outros'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface BookingRow {
  id: string
  professional_id: string
  client_name: string
  client_phone: string
  service: string
  date: string
  status: BookingStatus
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  is_blocked?: boolean
  /** Link público de agendamento (único quando preenchido) */
  slug: string | null
  category: ProfessionalCategory | null
  city: string | null
  state: string | null
  /** Lista de serviços na página pública (JSON no Supabase) */
  service_catalog?: unknown
  created_at: string
  updated_at: string
}

export interface WorkingHours {
  id: string
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
}

export interface Break {
  id: string
  professional_id: string
  day_of_week: number | null
  start_time: string
  end_time: string
  description: string | null
  created_at: string
}

export interface BlockedDate {
  id: string
  professional_id: string
  blocked_date: string
  reason: string | null
  created_at: string
}

export interface ServiceCategory {
  id: string
  professional_id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  professional_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  duration_minutes: number
  image_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  professional_id: string
  user_id: string | null
  name: string
  email: string | null
  phone: string
  notes: string | null
  total_appointments: number
  total_spent: number
  last_visit: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  professional_id: string
  client_id: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  price: number
  notes: string | null
  cancellation_reason: string | null
  canceled_at: string | null
  canceled_by: string | null
  confirmed_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  // Joined data
  client?: Client
  service?: Service
}

export interface Subscription {
  id: string
  professional_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  monthly_price_cents: number | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  professional_id: string
  amount_cents: number
  currency: string
  status: string
  description: string | null
  paid_at: string | null
  created_at: string
}

export interface Review {
  id: string
  professional_id: string
  client_id: string
  appointment_id: string | null
  rating: number
  comment: string | null
  is_visible: boolean
  professional_reply: string | null
  replied_at: string | null
  created_at: string
  client?: Client
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  status: TicketStatus
  priority: number
  created_at: string
  updated_at: string
  closed_at: string | null
  messages?: SupportMessage[]
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_from_admin: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  read_at: string | null
  data: Record<string, unknown> | null
  created_at: string
}

export interface Coupon {
  id: string
  professional_id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase: number
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
}

export interface LoyaltyPoints {
  id: string
  client_id: string
  points: number
  total_earned: number
  total_redeemed: number
  updated_at: string
}

export interface LoyaltyTransaction {
  id: string
  loyalty_id: string
  appointment_id: string | null
  points: number
  description: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface PlatformSettings {
  id: string
  key: string
  value: Record<string, unknown>
  description: string | null
  updated_at: string
}

// Dashboard stats types
export interface DashboardStats {
  totalRevenue: number
  totalAppointments: number
  totalClients: number
  confirmationRate: number
  cancellationCount: number
  topServices: { name: string; count: number; revenue: number }[]
  recentAppointments: Appointment[]
  revenueByPeriod: { date: string; revenue: number }[]
}

export interface AdminStats {
  totalUsers: number
  /** Perfis com role professional (sem tabela separada de profissionais) */
  profilesWithProfessionalRole: number
  totalRevenue: number
  activeSubscriptions: number
  canceledSubscriptions: number
  totalAppointments: number
  userGrowth: { date: string; count: number }[]
  revenueGrowth: { date: string; revenue: number }[]
}
