import { Button } from '@/components/ui/button'
import { LayoutDashboard, Package, Users, ShoppingCart, Boxes } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAuthenticated, removeToken } from '@/lib/auth'

interface NavigationProps {
  currentPage: 'dashboard' | 'products' | 'customers' | 'orders'
  onNavigate: (page: 'dashboard' | 'products' | 'customers' | 'orders') => void
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ] as const

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Boxes className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Inventory Pro</h1>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className={`gap-2 transition-all duration-200 ${
                    isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              )
            })}
            {mounted && (
              <>
                {isAuthenticated() ? (
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                      removeToken()
                      window.location.href = '/login'
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="ml-2"
                    onClick={() => {
                      window.location.href = '/login'
                    }}
                  >
                    Login
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
