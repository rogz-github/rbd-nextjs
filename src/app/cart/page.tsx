'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { useSession } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'
import ConfirmModal from '@/components/ConfirmModal'

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart()
  const { data: session } = useSession()
  const [showClearModal, setShowClearModal] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId)
    } else {
      await updateQuantity(cartItemId, newQuantity)
    }
  }

  const handleClearCart = async () => {
    setShowClearModal(true)
  }

  const confirmClearCart = async () => {
    setIsClearing(true)
    try {
      await clearCart()
      setShowClearModal(false)
    } finally {
      setIsClearing(false)
    }
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link 
              href="/products" 
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link 
            href="/products" 
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {state.items.map((item) => (
                  <div key={item.cart_id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Link href={`/products/${item.slug}`}>
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                            <Image
                              src={item.main_image || '/images/placeholder-product.jpg'}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                              style={{ width: 'auto', height: 'auto' }}
                              unoptimized={item.main_image?.startsWith('https://')}
                            />
                          </div>
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">{item.brand}</p>
                        <p className="text-sm text-gray-500">{item.category_1}</p>
                        <p className="text-sm text-gray-500">SKU: {item.spu_no}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.cart_id, item.prod_quantity - 1)}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            disabled={state.updating}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                            {item.prod_quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.cart_id, item.prod_quantity + 1)}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            disabled={state.updating}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.cart_id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          disabled={state.updating}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(item.itemTotal)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(Number(item.sale_price))} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {state.updating ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600">Updating...</span>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({state.itemCount} items)</span>
                    <span className="font-medium">{formatPrice(state.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {state.total >= 50 ? 'Free' : formatPrice(9.99)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(state.total * 0.08)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(state.total + (state.total >= 50 ? 0 : 9.99) + (state.total * 0.08))}</span>
                  </div>
                </div>
              )}

              {!state.updating && (
                <>
                  <Link 
                    href="/user/checkout" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-center block mb-4"
                  >
                    <div className="flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Proceed to Checkout
                    </div>
                  </Link>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      {session ? `Signed in as ${session.user?.name}` : 'Guest checkout available - no account required'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClearCart}
        title="Clear Shopping Cart"
        message={`Are you sure you want to remove all ${state.itemCount} items from your cart? This action cannot be undone.`}
        confirmText="Clear Cart"
        cancelText="Keep Items"
        type="warning"
        loading={isClearing}
      />
    </div>
  )
}