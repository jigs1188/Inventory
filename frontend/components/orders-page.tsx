'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { fetchWithAuth } from "@/lib/auth"

interface OrdersPageProps {
  orders: Order[]
  product_id: number
  quantity: number
  unit_price: number
  subtotal: number
}

interface OrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  subtotal: number
}

interface Order {
  id: number
  order_number: string
  customer_id: number
  status: string
  total_amount: number
  created_at: string
  order_items: OrderItem[]
  customer?: {
    id: number
    name: string
    email: string
  }
}

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock_quantity: number
}

interface Customer {
  id: number
  name: string
  email: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: '' }],
  })

  useEffect(() => {
    fetchOrders()
    fetchProducts()
    fetchCustomers()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth('http://localhost:8000/api/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetchWithAuth('http://localhost:8000/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetchWithAuth('http://localhost:8000/api/customers')
      if (!res.ok) throw new Error('Failed to fetch customers')
      const data = await res.json()
      setCustomers(data)
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const items = formData.items
        .filter(item => item.product_id && item.quantity)
        .map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        }))

      if (items.length === 0) {
        throw new Error('Please add at least one item to the order')
      }

      const res = await fetchWithAuth('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: parseInt(formData.customer_id),
          items,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to create order')
      }

      setFormData({ customer_id: '', items: [{ product_id: '', quantity: '' }] })
      setShowForm(false)
      toast.success('Order created successfully!')
      fetchOrders()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error creating order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: '' }],
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  if (error && !showForm) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground">Orders</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Order'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleAddOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Customer</label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Order Items</label>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[index].product_id = e.target.value
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="flex-1 px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stock_quantity}) - ${product.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[index].quantity = e.target.value
                      setFormData({ ...formData, items: newItems })
                    }}
                    placeholder="Qty"
                    className="w-20"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddItem}>
                Add Item
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                'Create Order'
              )}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : orders.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No orders found. Create one to get started!</p>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{order.order_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.name} ({order.customer?.email})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">${order.total_amount.toFixed(2)}</p>
                    <p className={`text-sm font-medium ${
                      order.status === 'confirmed' ? 'text-green-600' :
                      order.status === 'cancelled' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {order.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                {order.order_items.map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    Product #{item.product_id}: {item.quantity}x @ ${item.unit_price.toFixed(2)} = ${item.subtotal.toFixed(2)}
                  </p>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
