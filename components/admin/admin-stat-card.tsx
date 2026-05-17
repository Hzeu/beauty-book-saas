import type { LucideIcon } from 'lucide-react'

type AdminStatCardProps = {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
}

export function AdminStatCard({ title, value, description, icon: Icon }: AdminStatCardProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
          {description ? <p className="mt-1 text-xs text-zinc-500">{description}</p> : null}
        </div>
        <div className="flex size-11 items-center justify-center rounded-md bg-zinc-950 text-emerald-300">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}
