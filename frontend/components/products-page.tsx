'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AlertCircle, Package, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { fetchWithAuth } from '@/lib/auth'

interface Product {
  id: number
  sku: string
  name: string
  description: string
  price: number
  stock_quantity: number
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const queryParams = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''
      const res = await fetchWithAuth(`http://localhost:8000/api/products${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editingId 
        ? `http://localhost:8000/api/products/${editingId}` 
        : 'http://localhost:8000/api/products'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: formData.sku,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || (editingId ? 'Failed to update product' : 'Failed to add product'))
      }
      
      setFormData({ sku: '', name: '', description: '', price: '', stock_quantity: '' })
      setShowForm(false)
      setEditingId(null)
      toast.success(editingId ? 'Product updated successfully!' : 'Product added successfully!')
      fetchProducts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error adding product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 backdrop-blur-sm flex gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-destructive font-semibold">Error Loading Products</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your inventory and track stock levels</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              if (showForm) {
                setShowForm(false)
                setEditingId(null)
                setFormData({ sku: '', name: '', description: '', price: '', stock_quantity: '' })
              } else {
                setShowForm(true)
              }
            }} 
            className="gap-2 bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Product'}</span>
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-8 border-primary/20 bg-gradient-to-br from-card to-card/50">
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">SKU</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Product SKU"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Stock Quantity</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product Description"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingId ? 'Updating Product...' : 'Adding Product...'}
                </>
              ) : (
                editingId ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))
        ) : products.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No products found. Add one to get started!</p>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  )}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary mt-2" 
                    onClick={() => {
                      setFormData({
                        sku: product.sku,
                        name: product.name,
                        description: product.description || '',
                        price: product.price.toString(),
                        stock_quantity: product.stock_quantity.toString(),
                      });
                      setEditingId(product.id);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Edit Product
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</p>
                  <p className={`text-sm ${product.stock_quantity < 10 ? 'text-destructive' : 'text-green-600'}`}>
                    Stock: {product.stock_quantity}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
