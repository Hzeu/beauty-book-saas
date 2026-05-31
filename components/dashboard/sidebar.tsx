'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  ClipboardList,
  Users,
  Scissors,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  ExternalLink,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/auth-provider'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
  { name: 'Reservas', href: '/dashboard/reservas', icon: ClipboardList },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Serviços', href: '/dashboard/servicos', icon: Scissors },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
]

const secondaryNavigation = [
  { name: 'Horários', href: '/dashboard/horarios', icon: CalendarClock },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  { name: 'Ajuda', href: '/dashboard/ajuda', icon: HelpCircle },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { profile, subscription, signOut } = useAuth()

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            'flex h-16 items-center border-b border-sidebar-border px-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}>
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
                  <Sparkles className="size-4 text-sidebar-primary-foreground" />
                </div>
                <span className="font-bold">BeautyBook</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/dashboard">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
                  <Sparkles className="size-4 text-sidebar-primary-foreground" />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon className="size-5 shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </nav>

          {/* Secondary Navigation */}
          <div className="border-t border-sidebar-border px-2 py-4 space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon className="size-5 shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}

            {/* View Public Page */}
            {profile?.slug && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <ExternalLink className="size-5 shrink-0" />
                    {!isCollapsed && <span>Ver página pública</span>}
                  </a>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    Ver página pública
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </div>

          {/* Subscription Badge */}
          {!isCollapsed && subscription && (
            <div className="border-t border-sidebar-border px-4 py-3">
              <div className="rounded-lg bg-sidebar-accent/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium uppercase">
                    Plano {subscription.plan}
                  </span>
                  {subscription.status === 'trial' && (
                    <Badge variant="secondary" className="text-xs">
                      Trial
                    </Badge>
                  )}
                </div>
                {subscription.trial_ends_at && subscription.status === 'trial' && (
                  <p className="text-xs text-muted-foreground">
                    Trial expira em {new Date(subscription.trial_ends_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="border-t border-sidebar-border p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(profile?.full_name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">
                        {profile?.full_name || 'Usuário'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile?.email}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/configuracoes">
                    <Settings className="mr-2 size-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut()
                    router.replace('/auth/login')
                    router.refresh()
                  }}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 flex size-6 items-center justify-center rounded-full border border-border bg-background hover:bg-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
