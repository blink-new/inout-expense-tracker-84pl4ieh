import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Dashboard } from '@/pages/Dashboard'
import { Transactions } from '@/pages/Transactions'
import { Categories } from '@/pages/Categories'
import { Analytics } from '@/pages/Analytics'
import { Settings } from '@/pages/Settings'
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog'
import { blink } from '@/blink/client'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleAddTransaction = () => {
    setShowAddTransaction(true)
  }

  const handleTransactionAdded = () => {
    // Refresh data by triggering a re-render
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading InOut...</p>
          <p className="text-muted-foreground">Setting up your expense tracker</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-8">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to InOut</h1>
            <p className="text-muted-foreground">
              Track what you spend. Keep an eye on your money.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please sign in to start tracking your expenses
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onAddTransaction={handleAddTransaction}
        />
        
        <main className="flex-1 md:ml-64 p-4 md:p-6 pb-20 md:pb-6">
          {activeTab === 'dashboard' && (
            <Dashboard onAddTransaction={handleAddTransaction} />
          )}
          {activeTab === 'transactions' && (
            <Transactions onAddTransaction={handleAddTransaction} />
          )}
          {activeTab === 'categories' && (
            <Categories />
          )}
          {activeTab === 'analytics' && (
            <Analytics />
          )}
          {activeTab === 'settings' && (
            <Settings />
          )}
        </main>
      </div>

      <AddTransactionDialog
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  )
}

export default App