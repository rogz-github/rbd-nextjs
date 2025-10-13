'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Settings, ShoppingBag, Heart, CreditCard, MapPin } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ordersCount, setOrdersCount] = useState(0)
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch user orders count
  useEffect(() => {
    if (session?.user) {
      fetchOrdersCount()
    }
  }, [session])

  const fetchOrdersCount = async () => {
    try {
      const response = await fetch('/api/orders/user')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrdersCount(data.orders?.length || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching orders count:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {session.user?.firstName || session.user?.name || 'User'}!
                </h1>
                <p className="text-gray-600">{session.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingOrders ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : (
                      ordersCount
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wishlist</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saved Cards</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-3">
                <Link 
                  href="/profile/personal-info" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Personal Information</span>
                </Link>
                <Link 
                  href="/profile/addresses" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Addresses</span>
                </Link>
                <Link 
                  href="/profile/payment-methods" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Payment Methods</span>
                </Link>
                <Link 
                  href="/profile/settings" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Account Settings</span>
                </Link>
              </div>
            </div>

            {/* Order Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Management</h2>
              <div className="space-y-3">
                <Link 
                  href="/profile/orders" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Order History</span>
                </Link>
                <Link 
                  href="/profile/wishlist" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Wishlist</span>
                </Link>
                <Link 
                  href="/cart" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Shopping Cart</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600 mb-4">
                Your recent orders and activity will appear here.
              </p>
              <Link 
                href="/products" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
