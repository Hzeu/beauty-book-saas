'use client'

import { Calendar, Users, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/helpers'

interface DashboardStatsProps {
  stats: {
    todayAppointments: number
    monthAppointments: number
    monthRevenue: number
    totalClients: number
    pendingAppointments: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Agendamentos Hoje',
      value: stats.todayAppointments,
      icon: Calendar,
      description: `${stats.pendingAppointments} pendentes`,
      trend: stats.pendingAppointments > 0 ? 'warning' : 'neutral',
    },
    {
      title: 'Agendamentos no Mês',
      value: stats.monthAppointments,
      icon: TrendingUp,
      description: 'Total do mês atual',
      trend: 'neutral',
    },
    {
      title: 'Faturamento do Mês',
      value: formatCurrency(stats.monthRevenue),
      icon: DollarSign,
      description: 'Serviços concluídos',
      trend: 'positive',
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      description: 'Clientes cadastrados',
      trend: 'neutral',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stat.trend === 'warning' && <AlertCircle className="size-3 text-yellow-500" />}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
