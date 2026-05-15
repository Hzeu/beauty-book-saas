'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'

const links = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/payments', label: 'Pagamentos', icon: CreditCard },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Master</p>
        <p className="font-bold">BeautyBook Admin</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== '/admin' && pathname.startsWith(l.href))
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60',
              )}
            >
              <l.icon className="size-4" />
              {l.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
          <Link href="/dashboard">Painel profissional</Link>
        </Button>
        <form action={signOut}>
          <Button type="submit" variant="ghost" className="w-full justify-start text-destructive" size="sm">
            <LogOut className="mr-2 size-4" />
            Sair
          </Button>
        </form>
      </div>
    </aside>
  )
}
