'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { useSession } from 'next-auth/react'
import { calculatePricing, formatPrice } from '@/lib/pricing'
import ConfirmModal from '@/components/ConfirmModal'

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart, loadCart } = useCart()
  const { data: session } = useSession()
  const [showClearModal, setShowClearModal] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)


  // Note: Cart context handles loading cart data automatically
  // No need to reload on mount as it might interfere with the context's own loading logic

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItemToRemove(cartItemId.toString())
      setShowRemoveModal(true)
    } else {
      await updateQuantity(cartItemId, newQuantity)
    }
  }

  const handleRemoveItem = (cartItemId: number) => {
    setItemToRemove(cartItemId.toString())
    setShowRemoveModal(true)
  }


  const confirmRemoveItem = async () => {
    if (!itemToRemove) return
    
    setIsRemoving(true)
    try {
      await removeFromCart(parseInt(itemToRemove))
      setShowRemoveModal(false)
      setItemToRemove(null)
    } finally {
      setIsRemoving(false)
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

  if (state.loading || !state.loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
        
        <div className="relative container py-16">
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-20 scale-110"></div>
              <div className="relative bg-white rounded-full p-8 shadow-2xl">
                <ShoppingBag className="w-24 h-24 text-blue-600 mx-auto" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!</p>
            <Link 
              href="/products" 
              className="inline-flex items-center bg-gradient-primary hover:shadow-xl text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
      <div className="absolute inset-0 bg-pattern-grid opacity-20"></div>
      
      <div className="relative container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/products" 
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
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
                          onClick={() => handleRemoveItem(item.cart_id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          disabled={state.updating}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {(() => {
                            const pricing = calculatePricing(item.msrp, item.discounted_price)
                            const totalPrice = pricing.finalPrice * item.prod_quantity
                            return formatPrice(totalPrice)
                          })()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const pricing = calculatePricing(item.msrp, item.discounted_price)
                            return `${formatPrice(pricing.finalPrice)} each`
                          })()}
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
                    href="/checkout" 
                    className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-center block mb-4"
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

      {/* Remove Item Confirmation Modal */}
      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false)
          setItemToRemove(null)
        }}
        onConfirm={confirmRemoveItem}
        title="Remove Item from Cart"
        message="Are you sure you want to remove this item from your cart? This action cannot be undone."
        confirmText="Remove Item"
        cancelText="Keep Item"
        type="warning"
        loading={isRemoving}
      />
    </div>
  )
}