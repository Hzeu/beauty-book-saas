export type WorkingHourRow = {
  day_of_week: number
  start_time: string
  end_time: string
}

const DEFAULT_HOURS: WorkingHourRow[] = [
  { day_of_week: 1, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 2, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 3, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 4, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 5, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 6, start_time: '09:00', end_time: '13:00' },
]

function padTime(hm: string): string {
  const [h, m = '0'] = hm.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

/** Dia da semana 0=domingo para data Y-M-D (meio-dia UTC). */
function weekdayUtc(dayYmd: string): number {
  const [Y, M, D] = dayYmd.split('-').map((x) => parseInt(x, 10))
  return new Date(Date.UTC(Y, M - 1, D, 12, 0, 0)).getUTCDay()
}

/**
 * Gera horários ISO (UTC) em passos fixos, usando janela local BR (-03) no literal da data.
 */
export function buildHourlySlots(
  dayYmd: string,
  hours: WorkingHourRow[],
  occupiedUtcIso: string[],
  stepMinutes = 60,
): string[] {
  const dow = weekdayUtc(dayYmd)
  const rows = (hours?.length ? hours : DEFAULT_HOURS).filter((w) => w.day_of_week === dow)
  if (!rows.length) return []

  const occMin = new Set(occupiedUtcIso.map((t) => Math.floor(new Date(t).getTime() / 60000)))

  const slots: string[] = []
  for (const row of rows) {
    const start = new Date(`${dayYmd}T${padTime(row.start_time)}:00-03:00`)
    const end = new Date(`${dayYmd}T${padTime(row.end_time)}:00-03:00`)
    for (let t = start.getTime(); t < end.getTime(); t += stepMinutes * 60_000) {
      if (!occMin.has(Math.floor(t / 60000))) {
        slots.push(new Date(t).toISOString())
      }
    }
  }
  return [...new Set(slots)].sort()
}

export function formatSlotLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}
