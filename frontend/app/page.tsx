'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Dashboard from '@/components/dashboard'
import ProductsPage from '@/components/products-page'
import CustomersPage from '@/components/customers-page'
import OrdersPage from '@/components/orders-page'
import { isAuthenticated } from '@/lib/auth'

export default function Page() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'products' | 'customers' | 'orders'>('dashboard')
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    } else {
      setIsAuthChecking(false)
    }
  }, [router])

  const renderPage = () => {
    if (isAuthChecking) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'products':
        return <ProductsPage />
      case 'customers':
        return <CustomersPage />
      case 'orders':
        return <OrdersPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="animate-fade-in">
          {renderPage()}
        </div>
      </div>
    </main>
  )
}
