import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Moon, 
  Sun, 
  Download, 
  Trash2, 
  Shield,
  Bell,
  DollarSign,
  Database,
  LogOut
} from 'lucide-react'
import { blink } from '@/blink/client'

export function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [currency, setCurrency] = useState('USD')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      if (state.user) {
        setDisplayName(state.user.displayName || '')
        setEmail(state.user.email || '')
      }
    })
    return unsubscribe
  }, [])

  const handleUpdateProfile = async () => {
    if (!user) return
    
    try {
      await blink.auth.updateMe({
        displayName: displayName.trim()
      })
      // Show success message
      console.log('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleExportData = async () => {
    try {
      // Get all user data
      const [transactions, categories] = await Promise.all([
        blink.db.transactions.list({
          where: { userId: user.id },
          orderBy: { date: 'desc' }
        }),
        blink.db.categories.list({
          where: { userId: user.id },
          orderBy: { name: 'asc' }
        })
      ])

      // Create CSV content
      const csvContent = [
        'Date,Type,Amount,Description,Category',
        ...transactions.map(t => {
          const category = categories.find(c => c.id === t.categoryId)
          return `${t.date},${t.type},${t.amount},"${t.description || ''}","${category?.name || 'Uncategorized'}"`
        })
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inout-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const handleDeleteAllData = async () => {
    if (!user) return
    
    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This action cannot be undone.'
    )
    
    if (!confirmed) return

    try {
      // Delete all transactions and categories
      const [transactions, categories] = await Promise.all([
        blink.db.transactions.list({ where: { userId: user.id } }),
        blink.db.categories.list({ where: { userId: user.id } })
      ])

      // Delete transactions
      for (const transaction of transactions) {
        await blink.db.transactions.delete(transaction.id)
      }

      // Delete categories
      for (const category of categories) {
        await blink.db.categories.delete(category.id)
      }

      console.log('All data deleted successfully')
      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete data:', error)
    }
  }

  const handleSignOut = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>
          <Button onClick={handleUpdateProfile}>
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Currency</Label>
              <p className="text-sm text-muted-foreground">
                Display currency for amounts
              </p>
            </div>
            <Badge variant="secondary">USD ($)</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive spending alerts and reminders
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup your data
              </p>
            </div>
            <Switch
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground">
                Download all your transactions as CSV
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Delete All Data</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all transactions and categories
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAllData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Sign Out</Label>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>About InOut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Built with</span>
              <span className="text-sm">React + Blink SDK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last updated</span>
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}