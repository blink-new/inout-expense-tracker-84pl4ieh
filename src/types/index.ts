export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description?: string
  categoryId?: string
  userId: string
  date: string
  createdAt?: string
}

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  userId: string
  createdAt: string
}

export interface Budget {
  id: string
  categoryId?: string
  amount: number
  period: 'weekly' | 'monthly'
  userId: string
  createdAt: string
}

export interface DashboardStats {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  monthlyIncome: number
  monthlyExpenses: number
  weeklyIncome: number
  weeklyExpenses: number
}

export interface ChartData {
  name: string
  income: number
  expense: number
  date: string
}