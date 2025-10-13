'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, MapPin, User, Calendar, DollarSign, Phone, Mail } from 'lucide-react'

interface OrderItem {
  id: number
  quantity: number
  price: number
  product: {
    id: number
    name: string
    price: number
    images: string[]
    description: string
    slug?: string
  }
}

interface Order {
  coId: number
  coOrderId: string
  coStatus: string
  coTotalPrice: number | string
  coUserId: number
  coType: string
  coSubtotal?: number
  coTax?: number
  coShipping?: number
  orderItems: OrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    address?: string
    address1?: string
    address2?: string
    city: string
    state: string
    zipCode?: string
    zip?: string
    country: string
    phone?: string
  }
  billingAddress: {
    firstName: string
    lastName: string
    address?: string
    address1?: string
    address2?: string
    city: string
    state: string
    zipCode?: string
    zip?: string
    country: string
    phone?: string
  }
  user: {
    id: number
    name: string
    email: string
    phone?: string
  }
  subtotal: number
  tax: number
  shipping: number
  total: number
  createdAt: string
  updatedAt: string
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Get order ID from params
    const orderId = params.id as string
    console.log('Frontend - Order ID from params:', orderId)
    
    if (orderId) {
      fetchOrder(orderId)
    }
  }, [session, status, router, params.id])

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/user/${id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      
      console.log('Frontend - API Response:', data)
      
      if (response.ok && data.success) {
        console.log('Frontend - Order data:', data.order)
        console.log('Frontend - Order items:', data.order.orderItems)
        console.log('Frontend - Shipping address:', data.order.shippingAddress)
        console.log('Frontend - Billing address:', data.order.billingAddress)
        
        if (data.order.orderItems && data.order.orderItems.length > 0) {
          data.order.orderItems.forEach((item: any, index: number) => {
            console.log(`Frontend - Item ${index}:`, {
              name: item.product.name,
              price: item.price,
              quantity: item.quantity,
              total: item.price * item.quantity
            })
          })
        }
        
        setOrder(data.order)
      } else {
        setError(data.error || 'Failed to fetch order')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'created':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href="/orders" className="btn btn-primary">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
            <Link href="/orders" className="btn btn-primary">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/orders" 
              className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order #{order.coOrderId}
                </h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.coStatus)}`}>
                {order.coStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.orderItems.map((item) => {
                    console.log('Rendering item:', {
                      id: item.id,
                      name: item.product.name,
                      price: item.price,
                      quantity: item.quantity,
                      total: item.price * item.quantity
                    })
                    
                    return (
                      <Link 
                        key={item.id} 
                        href={`/products/${item.product.slug || item.product.id}`}
                        className="block"
                      >
                        <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                            {item.product.images && item.product.images.length > 0 ? (
                              <Image 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400 group-hover:text-pink-500 transition-colors" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">{item.product.name}</h3>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-sm text-gray-600">${Number(item.price).toFixed(2)} each</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${Number(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${Number(order.subtotal || order.coSubtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {(order.shipping || order.coShipping || 0) === 0 ? 'Free' : `$${Number(order.shipping || order.coShipping || 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${Number(order.total || order.coTotalPrice || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h2>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {order.user.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {order.user.email}
                  </p>
                  {order.user.phone && (
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {order.user.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h2>
                <div className="text-sm text-gray-600">
                  {order.shippingAddress && (order.shippingAddress.firstName || order.shippingAddress.lastName) ? (
                    <>
                      <p className="font-medium text-gray-900">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.address1 || order.shippingAddress.address}</p>
                      {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode || order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && (
                        <p className="mt-2 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {order.shippingAddress.phone}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 italic">Shipping address not available</p>
                      <p className="text-xs text-gray-400 mt-1">Debug: {JSON.stringify(order.shippingAddress)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Billing Address
                </h2>
                <div className="text-sm text-gray-600">
                  {(() => {
                    // Check if we have valid billing address data
                    const hasBillingAddress = order.billingAddress && (order.billingAddress.firstName || order.billingAddress.lastName);
                    const hasShippingAddress = order.shippingAddress && (order.shippingAddress.firstName || order.shippingAddress.lastName);
                    
                    if (!hasBillingAddress) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-gray-500 italic">Billing address not available</p>
                          <p className="text-xs text-gray-400 mt-1">Debug: {JSON.stringify(order.billingAddress)}</p>
                        </div>
                      );
                    }
                    
                    // Check if billing address is the same as shipping address
                    const isSameAddress = hasShippingAddress && 
                      order.billingAddress.firstName === order.shippingAddress.firstName &&
                      order.billingAddress.lastName === order.shippingAddress.lastName &&
                      (order.billingAddress.address1 || order.billingAddress.address) === (order.shippingAddress.address1 || order.shippingAddress.address) &&
                      order.billingAddress.city === order.shippingAddress.city &&
                      order.billingAddress.state === order.shippingAddress.state &&
                      (order.billingAddress.zip || order.billingAddress.zipCode) === (order.shippingAddress.zip || order.shippingAddress.zipCode) &&
                      order.billingAddress.country === order.shippingAddress.country;

                    if (isSameAddress) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-gray-500 italic">Same as shipping address</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <p className="font-medium text-gray-900">
                          {order.billingAddress.firstName} {order.billingAddress.lastName}
                        </p>
                        <p>{order.billingAddress.address1 || order.billingAddress.address}</p>
                        {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                        <p>
                          {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode || order.billingAddress.zip}
                        </p>
                        <p>{order.billingAddress.country}</p>
                        {order.billingAddress.phone && (
                          <p className="mt-2 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {order.billingAddress.phone}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
