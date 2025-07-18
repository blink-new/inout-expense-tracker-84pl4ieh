import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  CreditCard, 
  FolderOpen, 
  BarChart3, 
  Settings,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onAddTransaction: () => void
}

export function Navigation({ activeTab, onTabChange, onAddTransaction }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card p-4">
        <div className="flex flex-col w-full space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start h-11',
                  activeTab === item.id && 'bg-primary text-primary-foreground'
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="flex items-center justify-around p-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  'flex-col h-12 w-12 p-1',
                  activeTab === item.id && 'text-primary'
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            )
          })}
          <Button
            size="sm"
            className="flex-col h-12 w-12 p-1 bg-primary text-primary-foreground"
            onClick={onAddTransaction}
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs mt-1">Add</span>
          </Button>
        </div>
      </nav>

      {/* Desktop FAB */}
      <Button
        size="lg"
        className="hidden md:flex fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={onAddTransaction}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  )
}