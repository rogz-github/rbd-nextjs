'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/cart-context'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { User, Mail, Phone, MapPin, CreditCard, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { calculatePricing, formatPrice } from '@/lib/pricing'

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
    email: session?.user?.email || 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main Street',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
    phone: '+1 (555) 123-4567',
    sameAsBilling: true,
  })
  const [formErrors, setFormErrors] = useState<Partial<CheckoutFormData>>({})
  const [isFormValid, setIsFormValid] = useState(false)

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

  // Validate form whenever formData changes
  useEffect(() => {
    validateForm()
  }, [formData])

  const validateForm = () => {
    const errors: Partial<CheckoutFormData> = {}
    
    // Required fields validation
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.address.trim()) errors.address = 'Address is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.state.trim()) errors.state = 'State is required'
    if (!formData.zip.trim()) errors.zip = 'ZIP code is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    
    // Email format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Phone format validation (basic)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    setFormErrors(errors)
    const isValid = Object.keys(errors).length === 0
    setIsFormValid(isValid)
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof CheckoutFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
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
        paypalResponse: {
          id: paypalOrderId,
          status: details.status || 'COMPLETED',
          payer: details.payer || null,
          purchase_units: details.purchase_units || null,
          create_time: details.create_time || new Date().toISOString(),
          update_time: details.update_time || new Date().toISOString()
        },
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
        console.log('✅ Order created successfully:', orderResponse)
        
        // Set payment completed flag to prevent cart redirect
        setPaymentCompleted(true)
        
        // Clear cart
        await clearCart()
        
        // Show success message
        toast.success('Payment successful! Redirecting to confirmation page...')
        
        // Redirect to success page
        const successUrl = `/checkout/success?orderId=${orderResponse.id}&orderNumber=${orderResponse.orderNumber}`
        console.log('🔄 Redirecting to success page:', successUrl)
        
        // Use replace instead of push to prevent back button issues
        router.replace(successUrl)
      } else {
        const errorMessage = orderResponse.error || orderResponse.message || 'Failed to create order'
        console.error('❌ Order creation failed:', errorMessage)
        toast.error(`Order failed: ${errorMessage}`)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ Order processing error:', error)
      toast.error(`Failed to process order: ${error instanceof Error ? error.message : 'Please try again.'}`)
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
                    className={`input w-full ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
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
                      className={`input w-full ${formErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
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
                      className={`input w-full ${formErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
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
                    className={`input w-full ${formErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
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
                      className={`input w-full ${formErrors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                    )}
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
                      className={`input w-full ${formErrors.state ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                    )}
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
                      className={`input w-full ${formErrors.zip ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {formErrors.zip && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.zip}</p>
                    )}
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
                    className={`input w-full ${formErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
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
                  
              

                  {!isFormValid && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Complete Required Information</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Please fill in all required shipping address fields before proceeding with payment.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <PayPalScriptProvider
                    options={{
                      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb',
                      currency: 'USD',
                      intent: 'capture',
                    }}
                  >
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        if (!isFormValid) {
                          toast.error('Please complete all required fields before proceeding with payment.')
                          throw new Error('Form validation failed')
                        }
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
                      disabled={!isFormValid}
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
                                  if (!isFormValid) {
                                    toast.error('Please complete all required fields before proceeding with payment.')
                                    return
                                  }
                                  
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
                                      router.push(`/checkout/success?orderId=${orderResponse.id}&orderNumber=${orderResponse.orderNumber}&paymentMethod=bank_transfer`)
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
                        {(() => {
                          const pricing = calculatePricing(item.msrp, item.discounted_price)
                          const totalPrice = pricing.finalPrice * item.prod_quantity
                          return formatPrice(totalPrice)
                        })()}
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
