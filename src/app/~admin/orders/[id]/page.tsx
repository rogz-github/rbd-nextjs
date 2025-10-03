'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  }
}

interface Order {
  coId: number
  orderNumber: string
  coStatus: string
  notes?: string
  coSubtotal?: number
  coTax?: number
  coShipping?: number
  coTotal?: number
  subtotal?: number
  tax?: number
  shipping?: number
  total?: number
  createdAt: string
  updatedAt: string
  user: {
    id: number
    name: string
    email: string
    phone?: string
  }
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
}

const statusConfig = {
  PENDING: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock 
  },
  PROCESSING: { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-800', 
    icon: RefreshCw 
  },
  SHIPPED: { 
    label: 'Shipped', 
    color: 'bg-purple-100 text-purple-800', 
    icon: Truck 
  },
  DELIVERED: { 
    label: 'Delivered', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle 
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle 
  },
  REFUNDED: { 
    label: 'Refunded', 
    color: 'bg-gray-100 text-gray-800', 
    icon: AlertCircle 
  },
  // Handle title case variations from database
  'Pending': { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock 
  },
  'Processing': { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-800', 
    icon: RefreshCw 
  },
  'Shipped': { 
    label: 'Shipped', 
    color: 'bg-purple-100 text-purple-800', 
    icon: Truck 
  },
  'Delivered': { 
    label: 'Delivered', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle 
  },
  'Cancelled': { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle 
  },
  'Refunded': { 
    label: 'Refunded', 
    color: 'bg-gray-100 text-gray-800', 
    icon: AlertCircle 
  }
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || !session.user?.isAdmin) {
      router.push('/~admin')
      return
    }

    if (orderId) {
      fetchOrder()
    }
  }, [session, status, router, orderId])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()

      if (data.success) {
        setOrder(data.order)
        setNewStatus(data.order.coStatus)
        setNotes(data.order.notes || '')
      } else {
        showToast(data.error || 'Failed to fetch order', 'error')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      showToast('Error fetching order', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coStatus: newStatus,
          notes: notes
        })
      })

      const data = await response.json()

      if (data.success) {
        setOrder(data.order)
        setEditingStatus(false)
        showToast('Order status updated successfully!', 'success')
      } else {
        showToast(data.error || 'Failed to update order', 'error')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      showToast('Error updating order', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link
            href="/~admin/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const currentStatus = statusConfig[order.coStatus as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = currentStatus.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/~admin/orders"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!editingStatus ? (
                <button
                  onClick={() => setEditingStatus(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingStatus(false)
                      setNewStatus(order.coStatus)
                      setNotes(order.notes || '')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
              {editingStatus ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(statusConfig).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes about this order..."
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {currentStatus.label}
                  </span>
                  {order.notes && (
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  )}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems && Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
                  order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No order items found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal || order.coSubtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(order.tax || order.coTax || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatCurrency(order.shipping || order.coShipping || 0)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(order.total || order.coTotal || 0)}</span>
                  </div>
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
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address || order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode || order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2">{order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Billing Address
              </h2>
              <div className="text-sm text-gray-600">
                {(() => {
                  // Check if billing address is the same as shipping address
                  const isSameAddress = 
                    order.billingAddress.firstName === order.shippingAddress.firstName &&
                    order.billingAddress.lastName === order.shippingAddress.lastName &&
                    (order.billingAddress.address || order.billingAddress.address1) === (order.shippingAddress.address || order.shippingAddress.address1) &&
                    order.billingAddress.city === order.shippingAddress.city &&
                    order.billingAddress.state === order.shippingAddress.state &&
                    (order.billingAddress.zipCode || order.billingAddress.zip) === (order.shippingAddress.zipCode || order.shippingAddress.zip) &&
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
                      <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                      <p>{order.billingAddress.address || order.billingAddress.address1}</p>
                      {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                      <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode || order.billingAddress.zip}</p>
                      <p>{order.billingAddress.country}</p>
                      {order.billingAddress.phone && (
                        <p className="mt-2">{order.billingAddress.phone}</p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Order Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Placed</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[10000]">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
