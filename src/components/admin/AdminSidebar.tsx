'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3,
  FileText,
  Mail,
  Calendar,
  Kanban,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronUp,
  ChevronDown,
  PieChart,
  ShoppingBag,
  Shirt,
  Plus,
  List,
  Percent,
  Tag
} from 'lucide-react'
import RbdLogo from '@/components/RbdLogo'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/~admin/dashboard',
    icon: PieChart,
    active: true
  }
]

// This will be moved inside the component to be dynamic

const productItems = [
  {
    title: 'Add Product',
    href: '/~admin/products/add',
    icon: Plus
  },
  {
    title: 'All Products',
    href: '/~admin/products',
    icon: List
  },
  {
    title: 'Sale Products',
    href: '/~admin/products/sale',
    icon: Percent
  },
  {
    title: 'Coupons',
    href: '/~admin/coupons',
    icon: Tag
  }
]

interface AdminSidebarProps {
  isMobileOpen: boolean
  onMobileClose: () => void
}

export function AdminSidebar({ isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isCheckoutsOpen, setIsCheckoutsOpen] = useState(true)
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Fetch pending orders count
  const fetchOrdersCount = async () => {
    if (!session?.user?.isAdmin) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/orders/count?status=Pending')
      if (response.ok) {
        const data = await response.json()
        setPendingOrdersCount(data.pending || 0)
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrdersCount()
  }, [session])

  // Refresh orders count every 30 seconds
  useEffect(() => {
    if (!session?.user?.isAdmin) return

    const interval = setInterval(() => {
      fetchOrdersCount()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [session])

  // Dynamic checkout items with real count
  const checkoutItems = [
    {
      title: 'Orders',
      href: '/~admin/orders',
      badge: loading ? '...' : pendingOrdersCount.toString(),
      badgeColor: pendingOrdersCount > 0 ? 'bg-yellow-500' : 'bg-gray-400'
    },
    {
      title: 'Abandoned Checkout',
      href: '/~admin/abandoned-checkout'
    }
  ]



  // Close mobile sidebar when route changes - temporarily disabled to fix double-click issue
  // useEffect(() => {
  //   if (isMobileOpen) {
  //     onMobileClose()
  //   }
  // }, [pathname, onMobileClose, isMobileOpen])

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        h-full flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {isCollapsed ? (
              <RbdLogo className="h-8 w-8" />
            ) : (
              <RbdLogo className="h-8 w-auto" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Mobile Close Button */}
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
            {/* Desktop Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-300" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 overflow-y-auto flex-1">
        {/* Dashboard */}
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              {!isCollapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Link>
          )
        })}

        {/* CHECKOUTS Section */}
        {!isCollapsed && (
          <div className="mt-6">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                CHECKOUTS
              </h3>
            </div>
            
            {/* Checkouts Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsCheckoutsOpen(!isCheckoutsOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group bg-gray-800 text-white hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-5 h-5 text-gray-300" />
                  <span className="font-medium">Checkouts</span>
                </div>
                {isCheckoutsOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {/* Dropdown Items */}
              {isCheckoutsOpen && (
                <div className="ml-8 space-y-1">
                  {checkoutItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{item.title}</span>
                        {item.badge && (
                          <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS Section */}
        {!isCollapsed && (
          <div className="mt-6">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                PRODUCTS
              </h3>
            </div>
            
            {/* Products Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group bg-gray-800 text-white hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <Shirt className="w-5 h-5 text-gray-300" />
                  <span className="font-medium">Products</span>
                </div>
                {isProductsOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {/* Dropdown Items */}
              {isProductsOpen && (
                <div className="ml-8 space-y-1">
                  {productItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-300">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">John Doe</p>
                <p className="text-xs text-gray-400 truncate">Admin</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
