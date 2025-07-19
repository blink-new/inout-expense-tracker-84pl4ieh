import { useState, useEffect, useCallback } from 'react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { blink } from '@/blink/client'
import { Transaction, DashboardStats, ChartData } from '@/types'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns'

interface DashboardProps {
  onAddTransaction: () => void
}

export function Dashboard({ onAddTransaction }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    weeklyIncome: 0,
    weeklyExpenses: 0,
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      // Load all transactions
      const transactions = await blink.db.transactions.list({
        where: { userId },
        orderBy: { date: 'desc' }
      })

      // Calculate stats
      const newStats = calculateStats(transactions)
      setStats(newStats)

      // Generate chart data
      const newChartData = generateChartData(transactions, chartPeriod)
      setChartData(newChartData)

      // Set recent transactions (last 5)
      setRecentTransactions(transactions.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [chartPeriod])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadDashboardData(state.user.id)
      }
    })
    return unsubscribe
  }, [loadDashboardData])

  // Reload data when chart period changes
  useEffect(() => {
    if (user) {
      loadDashboardData(user.id)
    }
  }, [chartPeriod, user, loadDashboardData])

  const calculateStats = (transactions: Transaction[]): DashboardStats => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    let totalIncome = 0
    let totalExpenses = 0
    let monthlyIncome = 0
    let monthlyExpenses = 0
    let weeklyIncome = 0
    let weeklyExpenses = 0

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      const amount = transaction.amount

      if (transaction.type === 'income') {
        totalIncome += amount
        if (transactionDate >= monthStart && transactionDate <= monthEnd) {
          monthlyIncome += amount
        }
        if (transactionDate >= weekStart && transactionDate <= weekEnd) {
          weeklyIncome += amount
        }
      } else {
        totalExpenses += amount
        if (transactionDate >= monthStart && transactionDate <= monthEnd) {
          monthlyExpenses += amount
        }
        if (transactionDate >= weekStart && transactionDate <= weekEnd) {
          weeklyExpenses += amount
        }
      }
    })

    return {
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      weeklyIncome,
      weeklyExpenses,
    }
  }

  const generateChartData = (transactions: Transaction[], period: 'week' | 'month'): ChartData[] => {
    const data: ChartData[] = []
    const now = new Date()

    if (period === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i)
        const dayTransactions = transactions.filter(t => 
          format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )

        const income = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const expense = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        data.push({
          name: format(date, 'EEE'),
          income,
          expense,
          date: format(date, 'yyyy-MM-dd')
        })
      }
    } else {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subDays(now, i * 7))
        const weekEnd = endOfWeek(subDays(now, i * 7))
        
        const weekTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate >= weekStart && transactionDate <= weekEnd
        })

        const income = weekTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const expense = weekTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        data.push({
          name: `Week ${4 - i}`,
          income,
          expense,
          date: format(weekStart, 'yyyy-MM-dd')
        })
      }
    }

    return data
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-muted-foreground">Here's your financial overview</p>
        </div>
        <Button onClick={onAddTransaction} className="hidden md:flex">
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Chart Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Spending Overview</h3>
            <div className="flex space-x-2">
              <Button
                variant={chartPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartPeriod('week')}
              >
                Week
              </Button>
              <Button
                variant={chartPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartPeriod('month')}
              >
                Month
              </Button>
            </div>
          </div>
          <SpendingChart data={chartData} period={chartPeriod} />
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={onAddTransaction}
                  >
                    Add your first transaction
                  </Button>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-primary" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-accent" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-primary' : 'text-accent'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}