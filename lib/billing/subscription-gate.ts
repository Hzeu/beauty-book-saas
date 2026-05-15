/** Regra de negócio: acesso ao painel profissional bloqueado por assinatura / trial. */
export function isSubscriptionAccessBlocked(sub: {
  status: string
  trial_ends_at: string | null
  current_period_end: string | null
} | null): boolean {
  if (!sub) return false

  const now = Date.now()

  if (sub.status === 'blocked' || sub.status === 'expired' || sub.status === 'suspended') {
    return true
  }

  if (sub.status === 'past_due') {
    return true
  }

  if (sub.status === 'canceled') {
    if (sub.current_period_end && new Date(sub.current_period_end).getTime() > now) {
      return false
    }
    return true
  }

  if (sub.status === 'trial' && sub.trial_ends_at) {
    return new Date(sub.trial_ends_at).getTime() < now
  }

  return false
}
