'use client'

import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface CartItem {
  cart_id: number
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
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: number) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: () => Promise<void>
  forceRefreshCart: () => Promise<void>
  debugReloadCart: () => Promise<void>
  debugClearLocalStorage: () => void
  debugShowGuestId: () => void
  debugTestCartWithGuestId: (testGuestId: string) => Promise<void>
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
    
    if (!session) {
      // Always check localStorage first, regardless of state.guestUserId
      const savedGuestId = localStorage.getItem('guestUserId')
      if (savedGuestId) {
        // If we have a saved guest ID, use it
        if (savedGuestId !== state.guestUserId) {
          dispatch({ type: 'SET_GUEST_USER_ID', payload: savedGuestId })
        } else {
        }
      } else {
        // Only generate new ID if none exists
        const newGuestId = (Math.floor(Math.random() * 1000000) + 100000).toString()
        localStorage.setItem('guestUserId', newGuestId)
        dispatch({ type: 'SET_GUEST_USER_ID', payload: newGuestId })
      }
    } else {
    }
  }, [session])

  const loadCart = useCallback(async () => {
    try {
      
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const params = new URLSearchParams()
      if (!session) {
        // Always use localStorage guest user ID if available, fallback to state
        const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
        if (guestUserId) {
          const guestId = guestUserId.toString()
          params.append('guestUserId', guestId)
          
          // Update state if it's different from localStorage
          if (guestId !== state.guestUserId) {
            dispatch({ type: 'SET_GUEST_USER_ID', payload: guestId })
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }
      }
      
      const url = `/api/cart/get?${params}`
      
      const response = await fetch(url)
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
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [session, state.guestUserId])

  // Load cart when guest user ID is set (separate from session changes)
  useEffect(() => {
    // Don't load cart if we're on a success page
    if (typeof window !== 'undefined' && window.location.pathname.includes('/success')) {
      return
    }
    
    // Only load cart if we have a guest user ID and no session
    if (!session && state.guestUserId) {
      loadCart()
    }
  }, [state.guestUserId, session, loadCart])

  // Load cart when session changes (for authenticated users)
  useEffect(() => {
    // Don't load cart if we're on a success page
    if (typeof window !== 'undefined' && window.location.pathname.includes('/success')) {
      return
    }
    
    // Load cart for authenticated users
    if (session) {
      loadCart()
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART_SUCCESS', payload: { message: 'Cart cleared' } })
    }
  }, [session, loadCart])

  // Reload cart when page becomes visible (handles external database changes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCart()
      }
    }

    const handleFocus = () => {
      loadCart()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadCart])


  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const requestBody: any = { productId, quantity }
      
      // Add guest user ID if not authenticated
      if (!session) {
        // Always use localStorage guest user ID if available, fallback to state
        const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
        if (guestUserId) {
          requestBody.guestUserId = guestUserId.toString()
        }
      }
      
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        dispatch({ type: 'ADD_ITEM_SUCCESS', payload: { message: data.message } })
        
        // If API generated a new guest user ID, update our state and localStorage
        if (data.userId && !session) {
          const newGuestId = data.userId.toString()
          localStorage.setItem('guestUserId', newGuestId)
          dispatch({ type: 'SET_GUEST_USER_ID', payload: newGuestId })
        }
        
        // Reload cart to get updated data
        await loadCart()
      } else {
        toast.error(data.message)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      toast.error('Failed to add item to cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true })
      
      const requestBody: any = { cartItemId, quantity }
      
      // Add guest user ID if not authenticated
      if (!session) {
        const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
        if (guestUserId) {
          requestBody.guestUserId = guestUserId
        }
      }
      
      
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
      toast.error('Failed to update cart item')
      dispatch({ type: 'SET_UPDATING', payload: false })
    }
  }, [session, state.guestUserId, loadCart])

  const removeFromCart = useCallback(async (cartItemId: number) => {
    try {
      
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Build URL with guest user ID if not authenticated
      let url = `/api/cart/remove?cartItemId=${cartItemId}`
      if (!session) {
        const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
        if (guestUserId) {
          url += `&guestUserId=${guestUserId}`
        }
      }
      
      
      const response = await fetch(url, {
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
      toast.error('Failed to remove item from cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [session, state.guestUserId, loadCart])

  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Remove all items one by one without reloading cart after each removal
      for (const item of state.items) {
        try {
          // Build URL with guest user ID if not authenticated
          let url = `/api/cart/remove?cartItemId=${item.cart_id}`
          if (!session) {
            const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
            if (guestUserId) {
              url += `&guestUserId=${guestUserId}`
            }
          }
          
          const response = await fetch(url, {
            method: 'DELETE',
          })
          
          const data = await response.json()
          
          if (!data.success) {
          }
        } catch (error) {
        }
      }
      
      dispatch({ type: 'CLEAR_CART_SUCCESS', payload: { message: 'Cart cleared successfully' } })
      toast.success('Cart cleared successfully')
    } catch (error) {
      toast.error('Failed to clear cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [session, state.guestUserId, state.items])

  // Debug function to force reload cart
  const debugReloadCart = useCallback(async () => {
    // Force reload
    await loadCart()
  }, [loadCart])

  // Force refresh cart - useful after adding items
  const forceRefreshCart = useCallback(async () => {
    // Clear any cached state and reload
    dispatch({ type: 'SET_LOADING', payload: true })
    await loadCart()
  }, [loadCart])

  // Debug function to clear localStorage and start fresh
  const debugClearLocalStorage = useCallback(() => {
    localStorage.removeItem('guestUserId')
    window.location.reload()
  }, [])

  // Debug function to show current guest user ID info
  const debugShowGuestId = useCallback(() => {
    // Debug function - no logging
  }, [])

  // Debug function to test cart with specific guest user ID
  const debugTestCartWithGuestId = useCallback(async (testGuestId: string) => {
    
    // Temporarily set the guest user ID
    const originalGuestId = state.guestUserId
    dispatch({ type: 'SET_GUEST_USER_ID', payload: testGuestId })
    localStorage.setItem('guestUserId', testGuestId)
    
    // Load cart with the test ID
    await loadCart()
    
    
    // Restore original guest ID
    if (originalGuestId) {
      dispatch({ type: 'SET_GUEST_USER_ID', payload: originalGuestId })
      localStorage.setItem('guestUserId', originalGuestId)
    } else {
      localStorage.removeItem('guestUserId')
    }
  }, [state.guestUserId, loadCart, state])

  return (
    <CartContext.Provider value={{ 
      state, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      loadCart,
      forceRefreshCart,
      debugReloadCart,
      debugClearLocalStorage,
      debugShowGuestId,
      debugTestCartWithGuestId
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
