'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Ban,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCog,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/finance', label: 'Finance', icon: CreditCard },
  { href: '/admin/professionals', label: 'Professionals', icon: UserCog },
  { href: '/admin/blocked', label: 'Blocked Accounts', icon: Ban },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
      <div className="border-b border-zinc-800 px-6 py-5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-emerald-400 text-zinc-950">
            <Shield className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Admin Master</p>
            <p className="font-bold">System Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
              )}
            >
              <link.icon className="size-4 shrink-0" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <form action={signOut}>
          <Button type="submit" variant="ghost" className="w-full justify-start text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <LogOut className="mr-2 size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}
