import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Format currency in BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Format date
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: ptBR })
}

// Format time
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

// Format date relative (e.g., "há 2 horas")
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
}

// Format smart date (today, tomorrow, yesterday, or full date)
export function formatSmartDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(d)) return 'Hoje'
  if (isTomorrow(d)) return 'Amanhã'
  if (isYesterday(d)) return 'Ontem'
  
  return format(d, "EEEE, d 'de' MMMM", { locale: ptBR })
}

// Format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}

// Format duration in minutes to human readable
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Validate phone number (Brazilian format)
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

// Validate CPF
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  
  return remainder === parseInt(cleaned.charAt(10))
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Calculate available time slots based on working hours and appointments
export function getAvailableSlots(
  workingHours: { start_time: string; end_time: string },
  breaks: { start_time: string; end_time: string }[],
  appointments: { start_time: string; end_time: string }[],
  serviceDuration: number
): string[] {
  const slots: string[] = []
  const startMinutes = timeToMinutes(workingHours.start_time)
  const endMinutes = timeToMinutes(workingHours.end_time)
  
  for (let current = startMinutes; current + serviceDuration <= endMinutes; current += 15) {
    const slotStart = minutesToTime(current)
    const slotEnd = minutesToTime(current + serviceDuration)
    
    // Check if slot overlaps with breaks
    const overlapsBreak = breaks.some(b => 
      timeOverlaps(slotStart, slotEnd, b.start_time, b.end_time)
    )
    
    // Check if slot overlaps with existing appointments
    const overlapsAppointment = appointments.some(a => 
      timeOverlaps(slotStart, slotEnd, a.start_time, a.end_time)
    )
    
    if (!overlapsBreak && !overlapsAppointment) {
      slots.push(slotStart)
    }
  }
  
  return slots
}

// Helper: Convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper: Convert minutes to time string
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

// Helper: Check if two time ranges overlap
function timeOverlaps(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)
  
  return s1 < e2 && e1 > s2
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

// Generate random color
export function randomColor(): string {
  const colors = [
    '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', 
    '#f97316', '#ef4444', '#eab308', '#06b6d4'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
