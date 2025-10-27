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
  Tag,
  Monitor,
  Image,
  Star,
  Grid3X3,
  Eye
} from 'lucide-react'
import RbdLogo from '@/components/RbdLogo'
import { ADMIN_ROUTES } from '@/config/admin-routes'

// Icon mapping for dynamic rendering
const iconMap: Record<string, any> = {
  Plus,
  List,
  Percent,
  Tag,
  Image,
  Grid3X3,
  Star,
  Package,
  Eye,
  PieChart,
  Settings
}

// Convert routes to sidebar format
const menuItems = ADMIN_ROUTES.menuItems.map(item => ({
  ...item,
  icon: iconMap[item.icon || 'PieChart'] || PieChart
}))

const productItems = ADMIN_ROUTES.productItems.map(item => ({
  ...item,
  icon: iconMap[item.icon || 'List'] || List
}))

const categoryItems = ADMIN_ROUTES.categoryItems

const pageItems = ADMIN_ROUTES.pageItems.map(item => ({
  ...item,
  icon: iconMap[item.icon || 'Image'] || Image
}))

interface AdminSidebarProps {
  isMobileOpen: boolean
  onMobileClose: () => void
}

export function AdminSidebar({ isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isCheckoutsOpen, setIsCheckoutsOpen] = useState(true)
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isPagesOpen, setIsPagesOpen] = useState(false)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Ensure client-side only rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch pending orders count (debounced)
  const fetchOrdersCount = async () => {
    if (!session?.user?.isAdmin) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/orders/count?status=Pending', {
        cache: 'no-store',
        next: { revalidate: 60 } // Cache for 60 seconds
      })
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
  }, [session?.user?.isAdmin]) // Only re-run when admin status changes

  // Refresh orders count every 60 seconds (reduced frequency)
  useEffect(() => {
    if (!session?.user?.isAdmin) return

    const interval = setInterval(() => {
      fetchOrdersCount()
    }, 60000) // 60 seconds - reduced frequency to improve performance

    return () => clearInterval(interval)
  }, [session?.user?.isAdmin])

  // Dynamic checkout items with real count - built from config with runtime badge
  const checkoutItems = ADMIN_ROUTES.checkoutItems.map((item, index) => ({
    title: item.title,
    href: item.href,
    badge: index === 0 ? (loading ? '...' : pendingOrdersCount.toString()) : undefined,
    badgeColor: index === 0 ? (pendingOrdersCount > 0 ? 'bg-yellow-500' : 'bg-gray-400') : (item.badgeColor || 'bg-gray-400')
  }))



  // Close mobile sidebar when route changes - temporarily disabled to fix double-click issue
  // useEffect(() => {
  //   if (isMobileOpen) {
  //     onMobileClose()
  //   }
  // }, [pathname, onMobileClose, isMobileOpen])

  // Show loading state until component is mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="fixed lg:static inset-y-0 left-0 z-50 w-64 h-full flex flex-col bg-gray-900 shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <RbdLogo className="h-8 w-auto" priority />
          </div>
        </div>
        <div className="p-4 space-y-2 flex-1">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-10 bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-10 bg-gray-700 rounded-lg mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

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
              <RbdLogo className="h-8 w-8" priority />
            ) : (
              <RbdLogo className="h-8 w-auto" priority />
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
              prefetch={true}
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
                        prefetch={true}
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

        {/* CATEGORIES Section */}
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
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group bg-gray-800 text-white hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <List className="w-5 h-5 text-gray-300" />
                  <span className="font-medium">Categories</span>
                </div>
                {isCategoriesOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {/* Dropdown Items */}
              {isCategoriesOpen && (
                <div className="ml-8 space-y-1">
                  {categoryItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
              
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
                        prefetch={true}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MANAGE PAGES Section */}
        {!isCollapsed && (
          <div className="mt-6">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                MANAGE PAGES
              </h3>
            </div>
            
            {/* Pages Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsPagesOpen(!isPagesOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group bg-gray-800 text-white hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gray-300" />
                  <span className="font-medium">Home Page</span>
                </div>
                {isPagesOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {/* Dropdown Items */}
              {isPagesOpen && (
                <div className="ml-8 space-y-1">
                  {pageItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
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
        {!isCollapsed && session?.user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-300">
                  {session.user.firstName?.[0] || ''}{session.user.lastName?.[0] || ''}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session.user.isSuperAdmin ? 'Super Admin' : session.user.isAdmin ? 'Admin' : 'User'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
