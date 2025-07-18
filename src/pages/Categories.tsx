import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Tag,
  Palette
} from 'lucide-react'
import { blink } from '@/blink/client'
import { Category } from '@/types'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const CATEGORY_COLORS = [
  '#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

const CATEGORY_ICONS = [
  '🍔', '🏠', '🚗', '💼', '🎮', '🛒', '💊', '✈️', '📚', '🎵',
  '💰', '🎯', '🏋️', '🍕', '☕', '🎬', '👕', '🔧', '🎨', '📱'
]

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏷️',
    color: '#10B981'
  })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadCategories(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  const loadCategories = async (userId: string) => {
    setLoading(true)
    try {
      const categoriesData = await blink.db.categories.list({
        where: { userId },
        orderBy: { name: 'asc' }
      })
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.name.trim()) return

    try {
      if (editingCategory) {
        // Update existing category
        await blink.db.categories.update(editingCategory.id, {
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color
        })
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: formData.name.trim(), icon: formData.icon, color: formData.color }
            : cat
        ))
      } else {
        // Create new category
        const newCategory = await blink.db.categories.create({
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
          userId: user.id
        })
        setCategories(prev => [...prev, newCategory])
      }

      // Reset form
      setFormData({ name: '', icon: '🏷️', color: '#10B981' })
      setShowAddDialog(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      icon: category.icon || '🏷️',
      color: category.color || '#10B981'
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (categoryId: string) => {
    try {
      await blink.db.categories.delete(categoryId)
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', icon: '🏷️', color: '#10B981' })
    setEditingCategory(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted-foreground">
            Organize your transactions with custom categories
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Food, Transportation, Entertainment"
                  required
                />
              </div>

              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-10 gap-2 mt-2">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={cn(
                        "p-2 text-lg rounded-lg border-2 hover:bg-muted transition-colors",
                        formData.icon === icon ? "border-primary bg-primary/10" : "border-border"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-all",
                        formData.color === color ? "border-foreground scale-110" : "border-border"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first category to organize your transactions
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${category.color || '#10B981'}20` }}
                    >
                      {category.icon || '🏷️'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${category.color || '#10B981'}20`,
                          color: category.color || '#10B981'
                        }}
                      >
                        <Palette className="mr-1 h-3 w-3" />
                        {category.color || '#10B981'}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-sm text-muted-foreground">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Default Categories Suggestion */}
      {categories.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              <span>Suggested Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Here are some popular categories to get you started:
            </p>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Food & Dining', icon: '🍔', color: '#EF4444' },
                { name: 'Transportation', icon: '🚗', color: '#3B82F6' },
                { name: 'Shopping', icon: '🛒', color: '#F59E0B' },
                { name: 'Entertainment', icon: '🎮', color: '#8B5CF6' },
                { name: 'Bills & Utilities', icon: '🏠', color: '#06B6D4' },
                { name: 'Healthcare', icon: '💊', color: '#EC4899' },
              ].map((suggestion) => (
                <Button
                  key={suggestion.name}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setFormData({
                      name: suggestion.name,
                      icon: suggestion.icon,
                      color: suggestion.color
                    })
                    setShowAddDialog(true)
                  }}
                >
                  <span className="mr-2">{suggestion.icon}</span>
                  {suggestion.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}