import type { Profile } from '@/lib/types/database'

type AdminHeaderProps = {
  profile: Pick<Profile, 'email' | 'full_name'> | null
}

export function AdminHeader({ profile }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Internal SaaS Control Plane</p>
          <h1 className="text-lg font-semibold">Operations Console</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{profile?.full_name || 'Admin Master'}</p>
          <p className="text-xs text-zinc-500">{profile?.email}</p>
        </div>
      </div>
    </header>
  )
}
