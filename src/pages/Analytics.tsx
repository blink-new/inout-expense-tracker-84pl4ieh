import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  PieChart,
  BarChart3,
  Target
} from 'lucide-react'
import { blink } from '@/blink/client'
import { Transaction, Category } from '@/types'
import { SpendingChart } from '@/components/dashboard/SpendingChart'

export function Analytics() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadData(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  const loadData = async (userId: string) => {
    setLoading(true)
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        blink.db.transactions.list({
          where: { userId },
          orderBy: { date: 'desc' }
        }),
        blink.db.categories.list({
          where: { userId },
          orderBy: { name: 'asc' }
        })
      ])

      setTransactions(transactionsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized'
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown Category'
  }

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return '#6B7280'
    const category = categories.find(c => c.id === categoryId)
    return category?.color || '#6B7280'
  }

  // Calculate analytics data
  const now = new Date()
  const periodStart = new Date()
  
  switch (period) {
    case 'week':
      periodStart.setDate(now.getDate() - 7)
      break
    case 'month':
      periodStart.setMonth(now.getMonth() - 1)
      break
    case 'year':
      periodStart.setFullYear(now.getFullYear() - 1)
      break
  }

  const periodTransactions = transactions.filter(t => 
    new Date(t.date) >= periodStart
  )

  const totalIncome = periodTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses

  // Category breakdown
  const categoryBreakdown = categories.map(category => {
    const categoryTransactions = periodTransactions.filter(t => 
      t.categoryId === category.id
    )
    const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
    const transactionCount = categoryTransactions.length
    
    return {
      ...category,
      totalAmount,
      transactionCount,
      percentage: totalExpenses > 0 ? (totalAmount / totalExpenses) * 100 : 0
    }
  }).filter(c => c.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)

  // Top spending categories
  const topCategories = categoryBreakdown.slice(0, 5)

  // Monthly comparison (if period is month)
  const previousPeriodStart = new Date(periodStart)
  const previousPeriodEnd = new Date(periodStart)
  
  switch (period) {
    case 'week':
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
      break
    case 'month':
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
      break
    case 'year':
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
      break
  }

  const previousPeriodTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return date >= previousPeriodStart && date < periodStart
  })

  const previousExpenses = previousPeriodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenseChange = previousExpenses > 0 
    ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">
            Insights into your spending patterns
          </p>
        </div>
        
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {periodTransactions.filter(t => t.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {periodTransactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-primary' : 'text-accent'}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netIncome >= 0 ? 'Positive' : 'Negative'} cash flow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Change</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expenseChange <= 0 ? 'text-primary' : 'text-accent'}`}>
              {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous {period}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Spending Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart period={period} />
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Top Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expense data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCategories.map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon || '🏷️'}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary">
                        {category.transactionCount} transactions
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(category.totalAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {periodTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseChange > 10 && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm">
                    📈 Your expenses increased by {expenseChange.toFixed(1)}% compared to the previous {period}. 
                    Consider reviewing your spending in the top categories.
                  </p>
                </div>
              )}
              
              {expenseChange < -10 && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm">
                    📉 Great job! Your expenses decreased by {Math.abs(expenseChange).toFixed(1)}% compared to the previous {period}.
                  </p>
                </div>
              )}

              {topCategories.length > 0 && topCategories[0].percentage > 40 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm">
                    ⚠️ {topCategories[0].name} accounts for {topCategories[0].percentage.toFixed(1)}% of your expenses. 
                    Consider setting a budget limit for this category.
                  </p>
                </div>
              )}

              {netIncome < 0 && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm">
                    💡 Your expenses exceed your income this {period}. Consider reducing spending or increasing income sources.
                  </p>
                </div>
              )}

              {periodTransactions.length < 5 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">
                    📝 You have only {periodTransactions.length} transactions this {period}. 
                    Make sure to log all your expenses for better insights.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}