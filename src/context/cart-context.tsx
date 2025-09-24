'use client'

import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface CartItem {
  cart_id: string
  user_type: string
  user_id: number
  prod_id: string
  prod_quantity: number
  status: string
  createdAt: string
  updatedAt: string
  product_id: string
  spu_no: string
  name: string
  slug: string
  sale_price: number
  msrp: number
  discounted_price: number
  main_image: string
  images: string[]
  brand: string
  category_1: string
  inventory: string
  itemTotal: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  loading: boolean
  updating: boolean
  loaded: boolean
  guestUserId: string | null
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'LOAD_CART'; payload: { items: CartItem[]; total: number; itemCount: number } }
  | { type: 'ADD_ITEM_SUCCESS'; payload: { message: string } }
  | { type: 'UPDATE_ITEM_SUCCESS'; payload: { message: string } }
  | { type: 'REMOVE_ITEM_SUCCESS'; payload: { message: string } }
  | { type: 'CLEAR_CART_SUCCESS'; payload: { message: string } }
  | { type: 'SET_GUEST_USER_ID'; payload: string }

const CartContext = createContext<{
  state: CartState
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: () => Promise<void>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_UPDATING':
      return { ...state, updating: action.payload }
    
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemCount: action.payload.itemCount,
        loading: false,
        loaded: true
      }
    
    case 'ADD_ITEM_SUCCESS':
      return { ...state, updating: false }
    
    case 'UPDATE_ITEM_SUCCESS':
      return { ...state, updating: false }
    
    case 'REMOVE_ITEM_SUCCESS':
      return { ...state, updating: false }
    
    case 'CLEAR_CART_SUCCESS':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        loading: false
      }
    
    case 'SET_GUEST_USER_ID':
      return { ...state, guestUserId: action.payload }
    
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    loading: true,
    updating: false,
    loaded: false,
    guestUserId: null
  })

  // Initialize guest user ID
  useEffect(() => {
    if (!session && !state.guestUserId) {
      const savedGuestId = localStorage.getItem('guestUserId')
      if (savedGuestId) {
        dispatch({ type: 'SET_GUEST_USER_ID', payload: savedGuestId })
      } else {
        const newGuestId = (Math.floor(Math.random() * 1000000) + 100000).toString()
        localStorage.setItem('guestUserId', newGuestId)
        dispatch({ type: 'SET_GUEST_USER_ID', payload: newGuestId })
      }
    }
  }, [session, state.guestUserId])

  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const params = new URLSearchParams()
      if (!session && state.guestUserId) {
        params.append('guestUserId', state.guestUserId)
      }
      
      const response = await fetch(`/api/cart/get?${params}`)
      const data = await response.json()
      
      if (data.success) {
        dispatch({
          type: 'LOAD_CART',
          payload: {
            items: data.cartItems,
            total: data.subtotal,
            itemCount: data.itemCount
          }
        })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [session, state.guestUserId])

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      console.log('Cart context addToCart called:', { productId, quantity })
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      })
      
      const data = await response.json()
      console.log('Cart add response:', data)
      
      if (data.success) {
        toast.success(data.message)
        dispatch({ type: 'ADD_ITEM_SUCCESS', payload: { message: data.message } })
        // Reload cart to get updated data
        await loadCart()
      } else {
        toast.error(data.message)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true })
      
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItemId, quantity }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        dispatch({ type: 'UPDATE_ITEM_SUCCESS', payload: { message: data.message } })
        // Reload cart to get updated data
        await loadCart()
      } else {
        toast.error(data.message)
        dispatch({ type: 'SET_UPDATING', payload: false })
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart item')
      dispatch({ type: 'SET_UPDATING', payload: false })
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch(`/api/cart/remove?cartItemId=${cartItemId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        dispatch({ type: 'REMOVE_ITEM_SUCCESS', payload: { message: data.message } })
        // Reload cart to get updated data
        await loadCart()
      } else {
        toast.error(data.message)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Failed to remove item from cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Remove all items one by one
      for (const item of state.items) {
        await removeFromCart(item.cart_id)
      }
      
      dispatch({ type: 'CLEAR_CART_SUCCESS', payload: { message: 'Cart cleared successfully' } })
      toast.success('Cart cleared successfully')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  return (
    <CartContext.Provider value={{ 
      state, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      loadCart 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
