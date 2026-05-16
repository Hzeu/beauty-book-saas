'use client'

import { useActionState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { updateWorkingHours, type WorkingHoursState } from '@/lib/actions/settings'
import { DAYS_OF_WEEK } from '@/lib/constants'
import type { WorkingHours } from '@/lib/types/database'

type Props = {
  workingHours: WorkingHours[]
}

export function WorkingHoursForm({ workingHours }: Props) {
  const [state, formAction, pending] = useActionState(
    async (prev: WorkingHoursState | undefined, fd: FormData) => updateWorkingHours(prev, fd),
    undefined,
  )

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success('Horários atualizados.')
  }, [state])

  const hoursByDay = new Map(workingHours.map((hour) => [hour.day_of_week, hour]))

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-card p-6">
      {DAYS_OF_WEEK.map((day) => {
        const hour = hoursByDay.get(day.value)
        const isActive = hour?.is_active ?? (day.value >= 1 && day.value <= 5)

        return (
          <div
            key={day.value}
            className="grid gap-4 rounded-lg border p-4 md:grid-cols-[140px_1fr_1fr_auto] md:items-center"
          >
            <div className="font-medium">{day.label}</div>
            <div className="space-y-2">
              <Label htmlFor={`start_${day.value}`}>Início</Label>
              <Input
                id={`start_${day.value}`}
                name={`start_${day.value}`}
                type="time"
                defaultValue={hour?.start_time?.slice(0, 5) ?? '09:00'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`end_${day.value}`}>Fim</Label>
              <Input
                id={`end_${day.value}`}
                name={`end_${day.value}`}
                type="time"
                defaultValue={hour?.end_time?.slice(0, 5) ?? '18:00'}
              />
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <Switch id={`active_${day.value}`} name={`active_${day.value}`} defaultChecked={isActive} />
              <Label htmlFor={`active_${day.value}`}>Ativo</Label>
            </div>
          </div>
        )
      })}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Salvar horários
      </Button>
    </form>
  )
}
