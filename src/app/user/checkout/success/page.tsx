'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Mail, MapPin } from 'lucide-react'

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
  orderItems: any[]
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
  paypalResponse: any
  coCreated: string
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const orderNumber = searchParams.get('orderNumber')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId)
    }
  }, [orderId])

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/user/${id}`)
      if (response.ok) {
        const orderData = await response.json()
        console.log('Fetched order data:', orderData)
        setOrder(orderData.order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
          <Link href="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-600">
              Thank you for your purchase. We've sent you a confirmation email.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Order Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">Order Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{orderNumber || order.coOrderId}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="text-lg sm:text-xl font-medium text-gray-900">
                    {new Date(order.coCreated).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-lg sm:text-xl font-medium text-green-600 capitalize">{order.coStatus}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600 mb-1">User Type</p>
                  <p className="text-lg sm:text-xl font-medium text-gray-900 capitalize">{order.coType}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Shipping Address
                </h2>
                <div className="text-center sm:text-left">
                  <p className="text-sm sm:text-base font-medium text-gray-900 mb-2">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-sm sm:text-base text-gray-700 mb-1">
                    {order.shippingAddress.address || order.shippingAddress.address1}
                  </p>
                  {order.shippingAddress.address2 && (
                    <p className="text-sm sm:text-base text-gray-700 mb-1">
                      {order.shippingAddress.address2}
                    </p>
                  )}
                  <p className="text-sm sm:text-base text-gray-700 mb-1">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode || order.shippingAddress.zip}
                  </p>
                  <p className="text-sm sm:text-base text-gray-700">
                    {order.shippingAddress.country}
                  </p>
                  {order.shippingAddress.phone && (
                    <p className="text-sm sm:text-base text-gray-700 mt-2">
                      Phone: {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Billing Address */}
            {order.billingAddress && (() => {
              // Check if billing address is the same as shipping address
              const isSameAddress = 
                order.billingAddress.firstName === order.shippingAddress.firstName &&
                order.billingAddress.lastName === order.shippingAddress.lastName &&
                (order.billingAddress.address || order.billingAddress.address1) === (order.shippingAddress.address || order.shippingAddress.address1) &&
                order.billingAddress.city === order.shippingAddress.city &&
                order.billingAddress.state === order.shippingAddress.state &&
                (order.billingAddress.zipCode || order.billingAddress.zip) === (order.shippingAddress.zipCode || order.shippingAddress.zip) &&
                order.billingAddress.country === order.shippingAddress.country;

              if (!isSameAddress) {
                return (
                  <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      Billing Address
                    </h2>
                    <div className="text-center sm:text-left">
                      <p className="text-sm sm:text-base font-medium text-gray-900 mb-2">
                        {order.billingAddress.firstName} {order.billingAddress.lastName}
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 mb-1">
                        {order.billingAddress.address || order.billingAddress.address1}
                      </p>
                      {order.billingAddress.address2 && (
                        <p className="text-sm sm:text-base text-gray-700 mb-1">
                          {order.billingAddress.address2}
                        </p>
                      )}
                      <p className="text-sm sm:text-base text-gray-700 mb-1">
                        {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode || order.billingAddress.zip}
                      </p>
                      <p className="text-sm sm:text-base text-gray-700">
                        {order.billingAddress.country}
                      </p>
                      {order.billingAddress.phone && (
                        <p className="text-sm sm:text-base text-gray-700 mt-2">
                          Phone: {order.billingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">Order Summary</h2>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">${(order.coSubtotal || (Number(order.coTotalPrice) * 0.92)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-medium">
                    {order.coShipping === 0 ? 'Free' : `$${(order.coShipping || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900 font-medium">${(order.coTax || (Number(order.coTotalPrice) * 0.08)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-gray-200 pt-3 sm:pt-4">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${Number(order.coTotalPrice).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Link href="/orders" className="w-full btn btn-primary text-center block text-sm sm:text-base py-3 sm:py-4">
                  View All Orders
                </Link>
                <Link href="/products" className="w-full btn btn-outline text-center block text-sm sm:text-base py-3 sm:py-4">
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-0.5 mr-3 sm:mr-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-blue-900">Confirmation Email Sent</p>
                    <p className="text-sm sm:text-base text-blue-700">
                      We've sent a confirmation email with your order details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
