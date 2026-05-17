import { Sparkles } from 'lucide-react'

type PublicBookingUnavailableProps = {
  message: string
}

export function PublicBookingUnavailable({ message }: PublicBookingUnavailableProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4">
      <div className="max-w-md space-y-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Sparkles className="size-6" />
        </div>
        <h1 className="text-xl font-semibold">Agendamento indisponível</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
