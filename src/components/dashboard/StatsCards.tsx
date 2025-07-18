import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react'
import { DashboardStats } from '@/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Balance */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground">
            Current balance
          </p>
        </CardContent>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          stats.totalBalance >= 0 ? 'bg-primary' : 'bg-accent'
        }`} />
      </Card>

      {/* Total Income */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(stats.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            +{formatCurrency(stats.monthlyIncome)} this month
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
      </Card>

      {/* Total Expenses */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(stats.totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            -{formatCurrency(stats.monthlyExpenses)} this month
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
      </Card>
    </div>
  )
}