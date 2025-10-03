'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/cart-context'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { User, Mail, Phone, MapPin, CreditCard, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface CheckoutFormData {
  email: string
  firstName: string
  lastName: string
  address: string
  apartment: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  sameAsBilling: boolean
}

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [paypalError, setPaypalError] = useState<string | null>(null)
  const [paypalTimeout, setPaypalTimeout] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: session?.user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
    sameAsBilling: true,
  })

  const shipping = state.total >= 50 ? 0 : 9.99
  const tax = state.total * 0.08
  const total = state.total + shipping + tax



  // Handle PayPal script loading errors and timeout
  useEffect(() => {
    const handleScriptError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('paypal')) {
        setPaypalError('Failed to load PayPal SDK. Please check your internet connection and PayPal configuration.')
      }
    }

    // Set timeout for PayPal loading
    const timeoutId = setTimeout(() => {
      if (!paypalLoaded) {
        setPaypalTimeout(true)
        setPaypalError('PayPal is taking longer than expected to load. Alternative payment options are available below.')
      }
    }, 5000) // 5 second timeout

    window.addEventListener('error', handleScriptError)
    
    return () => {
      window.removeEventListener('error', handleScriptError)
      clearTimeout(timeoutId)
    }
  }, [paypalLoaded])

  useEffect(() => {
    // Only redirect to cart if we're not processing payment and payment hasn't been completed
    if (state.items.length === 0 && !paymentCompleted && !isProcessing) {
      // Add a small delay to prevent race conditions
      const timer = setTimeout(() => {
        router.push('/cart')
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [state.items.length, router, paymentCompleted, isProcessing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handlePayPalSuccess = async (details: any) => {
    setIsProcessing(true)
    
    try {
    
      
      // Validate cart has items
      if (!state.items || state.items.length === 0) {
        throw new Error('Cart is empty')
      }
      
      // Get PayPal Order ID from details
      const paypalOrderId = details.id || details.orderID
      if (!paypalOrderId) {
        console.error('No PayPal Order ID found in details:', details)
        throw new Error('PayPal Order ID is required')
      }
      
      // Create order in database
      const orderData = {
        status: 'captured',
        amount: total,
        currency: 'USD',
        userId: session?.user?.id || parseInt(state.guestUserId || '0') || 0,
        userType: session?.user?.id ? 'registered' : 'guest',
        cartItems: state.items,
        paypalResponse: details,
        captureId: paypalOrderId,
        capturedAt: new Date().toISOString(),
        // Additional order details for reference
        orderDetails: {
          orderNumber: `ORDER-${Date.now()}`,
          subtotal: state.total,
          tax: tax,
          shipping: shipping,
          email: formData.email,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address1: formData.address,
            address2: formData.apartment,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            phone: formData.phone,
          },
          billingAddress: formData.sameAsBilling ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address1: formData.address,
            address2: formData.apartment,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            phone: formData.phone,
          } : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address1: formData.address,
            address2: formData.apartment,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            phone: formData.phone,
          },
        }
      }

   
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const orderResponse = await response.json()
      
      if (response.ok && orderResponse.success) {
        // Set payment completed flag to prevent cart redirect
        setPaymentCompleted(true)
        
        // Clear cart
        await clearCart()
        
        // Redirect to success page
        router.push(`/user/checkout/success?orderId=${orderResponse.id}&orderNumber=${orderResponse.orderNumber}`)
      } else {
        const errorMessage = orderResponse.error || orderResponse.message || 'Failed to create order'
        toast.error(`Order failed: ${errorMessage}`)
        throw new Error(errorMessage)
      }
    } catch (error) {
      toast.error('Failed to process order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayPalError = (error: any) => {
    setPaypalError(`Payment failed: ${error.message || 'Please try again.'}`)
    toast.error(`Payment failed: ${error.message || 'Please try again.'}`)
  }

  const handlePayPalScriptError = (error: any) => {
    setPaypalError('Failed to load PayPal. Please check your internet connection and try again.')
  }

  if (state.items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Information
                </h2>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="input w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment
                </h2>
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">
                    Secure payment powered by PayPal
                  </p>
                  
              

                  <PayPalScriptProvider
                    options={{
                      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb',
                      currency: 'USD',
                      intent: 'capture',
                    }}
                  >
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              amount: {
                                value: total.toFixed(2),
                                currency_code: 'USD',
                              },
                            },
                          ],
                        })
                      }}
                      onApprove={handlePayPalSuccess}
                      onError={handlePayPalError}
                      onInit={(data, actions) => {
                        setPaypalLoaded(true)
                      }}
                      style={{
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'paypal',
                      }}
                    />
                  </PayPalScriptProvider>
                  
                  {/* Loading state */}
                  {!paypalLoaded && !paypalError && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-blue-600">Loading PayPal...</span>
                      </div>
                    </div>
                  )}

                  {/* PayPal Error Display */}
                  {paypalError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">PayPal Error</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{paypalError}</p>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                setPaypalError(null)
                                setPaypalLoaded(false)
                                window.location.reload()
                              }}
                              className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback if PayPal doesn't load */}
                  {!paypalLoaded && !paypalError && (
                    <div className="mt-4 text-sm text-gray-500">
                      <p className="text-amber-600">
                        If PayPal buttons don't appear, please check your PayPal configuration and try refreshing the page.
                      </p>
                      <p className="mt-2">
                        Make sure your PayPal Client ID is set in your environment variables.
                      </p>
                    </div>
                  )}

                  {/* Alternative Payment Method */}
                  {paypalError && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Alternative Payment Options</h3>
                          <p className="text-sm text-gray-700 mb-4">
                            PayPal is currently unavailable. Please choose one of the alternative payment methods below:
                          </p>
                          
                          <div className="space-y-3">
                            {/* Try PayPal Again Option */}
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-2">Try PayPal Again</h4>
                              <p className="text-sm text-gray-600 mb-3">
                                Sometimes PayPal takes a moment to load. Try refreshing the page or clicking below.
                              </p>
                              <button
                                onClick={() => {
                                  setPaypalError(null)
                                  setPaypalLoaded(false)
                                  setPaypalTimeout(false)
                                  window.location.reload()
                                }}
                                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              >
                                Retry PayPal
                              </button>
                            </div>

                            {/* Bank Transfer Option */}
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-2">Bank Transfer</h4>
                              <p className="text-sm text-gray-600 mb-3">
                                Complete your order and we'll send you bank transfer details via email.
                              </p>
                              <button
                                onClick={async () => {
                                  try {
                                    // Create order without PayPal
                                    const orderData = {
                                      paymentMethod: 'bank_transfer',
                                      status: 'pending_payment',
                                      amount: total,
                                      currency: 'USD',
                                      userId: session?.user?.id || parseInt(state.guestUserId || '0') || 0,
                                      userType: session?.user?.id ? 'registered' : 'guest',
                                      cartItems: state.items,
                                      orderDetails: {
                                        orderNumber: `ORDER-${Date.now()}`,
                                        subtotal: state.total,
                                        tax: tax,
                                        shipping: shipping,
                                        email: formData.email,
                                        shippingAddress: {
                                          firstName: formData.firstName,
                                          lastName: formData.lastName,
                                          address1: formData.address,
                                          address2: formData.apartment,
                                          city: formData.city,
                                          state: formData.state,
                                          zip: formData.zip,
                                          country: formData.country,
                                          phone: formData.phone,
                                        },
                                      }
                                    }

                                    const response = await fetch('/api/orders', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify(orderData),
                                    })

                                    const orderResponse = await response.json()
                                    
                                    if (response.ok && orderResponse.success) {
                                      setPaymentCompleted(true)
                                      await clearCart()
                                      router.push(`/user/checkout/success?orderId=${orderResponse.id}&orderNumber=${orderResponse.orderNumber}&paymentMethod=bank_transfer`)
                                    } else {
                                      toast.error('Failed to create order. Please try again.')
                                    }
                                  } catch (error) {
                                    console.error('Order creation error:', error)
                                    toast.error('Failed to process order. Please try again.')
                                  }
                                }}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                Complete Order (Bank Transfer)
                              </button>
                            </div>

                            {/* Manual Payment Option */}
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-2">Contact for Payment</h4>
                              <p className="text-sm text-gray-600 mb-3">
                                Contact us directly to arrange payment and complete your order.
                              </p>
                              <button
                                onClick={() => {
                                  const orderSummary = `Order Summary:
Total: $${total.toFixed(2)}
Items: ${state.items.length}
Email: ${formData.email}

Please contact us to complete this order.`
                                  
                                  const emailBody = encodeURIComponent(orderSummary)
                                  const emailSubject = encodeURIComponent(`Order Inquiry - ${formData.email}`)
                                  window.open(`mailto:support@yourstore.com?subject=${emailSubject}&body=${emailBody}`)
                                }}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                Contact Us for Payment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <div key={item.cart_id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                        <Image
                          src={item.main_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.prod_quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(Number(item.sale_price) * item.prod_quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
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
