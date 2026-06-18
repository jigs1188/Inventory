'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Users, ShoppingCart, AlertCircle } from 'lucide-react'
import { fetchWithAuth } from '@/lib/auth'

interface Stats {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
  lowStockProducts: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          fetchWithAuth('http://localhost:8000/api/products'),
          fetchWithAuth('http://localhost:8000/api/customers'),
          fetchWithAuth('http://localhost:8000/api/orders'),
        ])

        if (!productsRes.ok || !customersRes.ok || !ordersRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const products = await productsRes.json()
        const customers = await customersRes.json()
        const orders = await ordersRes.json()

        const lowStock = products.filter((p: any) => p.stock_quantity < 10).length

        setStats({
          totalProducts: products.length,
          totalCustomers: customers.length,
          totalOrders: orders.length,
          lowStockProducts: lowStock,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 backdrop-blur-sm">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-destructive font-semibold">Connection Error</p>
            <p className="text-sm text-muted-foreground mt-1">Make sure the backend API is running on http://localhost:8000</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-accent bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Welcome back! Here&apos;s your inventory overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts}
          loading={loading}
          icon={Package}
          gradient="from-primary/20 to-primary/5"
          accent="text-primary"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers}
          loading={loading}
          icon={Users}
          gradient="from-blue-600/20 to-blue-600/5"
          accent="text-blue-600"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders}
          loading={loading}
          icon={ShoppingCart}
          gradient="from-green-600/20 to-green-600/5"
          accent="text-green-600"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockProducts}
          loading={loading}
          icon={AlertCircle}
          gradient="from-accent/20 to-accent/5"
          accent="text-accent"
          highlight={(stats?.lowStockProducts ?? 0) > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <Card className="lg:col-span-2 p-8 border-primary/30 border-2 bg-gradient-to-br from-primary/10 via-card to-card/50 hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
            <h2 className="text-2xl font-bold text-foreground">Quick Stats</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
              <span className="text-muted-foreground font-medium">Inventory Health</span>
              <span className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold">Good</span>
            </div>
            <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-blue-600/10 to-blue-600/5 border border-blue-600/20 hover:border-blue-600/40 transition-all duration-300 hover:shadow-md">
              <span className="text-muted-foreground font-medium">Active Customers</span>
              <span className="px-4 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 font-semibold">{stats?.totalCustomers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-green-600/10 to-green-600/5 border border-green-600/20 hover:border-green-600/40 transition-all duration-300 hover:shadow-md">
              <span className="text-muted-foreground font-medium">Recent Orders</span>
              <span className="px-4 py-1.5 rounded-lg bg-green-600/10 text-green-600 font-semibold">{stats?.totalOrders || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-accent/30 border-2 bg-gradient-to-br from-accent/10 via-card to-card/50 hover:border-accent/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-accent to-orange-500" />
            <h2 className="text-2xl font-bold text-foreground">System Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-600/10 border border-green-600/30">
              <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse shadow-lg shadow-green-600/50" />
              <span className="text-sm text-green-600 font-medium">Database: Connected</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-600/10 border border-green-600/30">
              <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse shadow-lg shadow-green-600/50" />
              <span className="text-sm text-green-600 font-medium">API: Running</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-600/10 border border-green-600/30">
              <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse shadow-lg shadow-green-600/50" />
              <span className="text-sm text-green-600 font-medium">Sync: Active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value?: number
  loading: boolean
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  accent: string
  highlight?: boolean
}

function StatCard({ title, value, loading, icon: Icon, gradient, accent, highlight }: StatCardProps) {
  return (
    <Card className={`group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/60 border-2 ${
      highlight ? 'border-accent/60 bg-gradient-to-br from-accent/8 to-card/40' : 'border-border/40 bg-card/50 hover:bg-card/70'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-xl`} />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
          <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg bg-gradient-to-br ${gradient.replace('from-', 'from-').replace('/40 to-', '/20 to-')}`}>
            <Icon className={`w-5 h-5 ${accent}`} />
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-4xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground font-medium">Total items tracked</p>
          </div>
        )}
      </div>
    </Card>
  )
}
