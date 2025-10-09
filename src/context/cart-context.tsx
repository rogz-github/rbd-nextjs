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
      console.log('LOAD_CART reducer called with:', action.payload)
      const newState = {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemCount: action.payload.itemCount,
        loading: false,
        loaded: true
      }
      console.log('New cart state:', newState)
      return newState
    
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
    console.log('=== GUEST USER ID INITIALIZATION ===')
    console.log('Session:', session)
    console.log('Current state.guestUserId:', state.guestUserId)
    console.log('localStorage guestUserId:', localStorage.getItem('guestUserId'))
    
    if (!session) {
      // Always check localStorage first, regardless of state.guestUserId
      const savedGuestId = localStorage.getItem('guestUserId')
      if (savedGuestId) {
        // If we have a saved guest ID, use it
        if (savedGuestId !== state.guestUserId) {
          console.log('Loading saved guest ID from localStorage:', savedGuestId)
          dispatch({ type: 'SET_GUEST_USER_ID', payload: savedGuestId })
        } else {
          console.log('Guest ID already set and matches localStorage:', savedGuestId)
        }
      } else {
        // Only generate new ID if none exists
        const newGuestId = (Math.floor(Math.random() * 1000000) + 100000).toString()
        console.log('No saved guest ID found, generating new one:', newGuestId)
        localStorage.setItem('guestUserId', newGuestId)
        dispatch({ type: 'SET_GUEST_USER_ID', payload: newGuestId })
      }
    } else {
      console.log('User is authenticated, skipping guest ID initialization')
    }
  }, [session])

  const loadCart = useCallback(async () => {
    try {
      console.log('=== LOADING CART ===')
      console.log('Session:', !!session)
      console.log('State guest user ID:', state.guestUserId)
      console.log('LocalStorage guest user ID:', localStorage.getItem('guestUserId'))
      
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const params = new URLSearchParams()
      if (!session) {
        // Always use localStorage guest user ID if available, fallback to state
        const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
        if (guestUserId) {
          const guestId = guestUserId.toString()
          console.log('Using guest user ID for cart loading:', guestId, 'type:', typeof guestId)
          params.append('guestUserId', guestId)
          
          // Update state if it's different from localStorage
          if (guestId !== state.guestUserId) {
            console.log('Updating state guest user ID to match localStorage')
            dispatch({ type: 'SET_GUEST_USER_ID', payload: guestId })
          }
        } else {
          console.log('No guest user ID available for cart loading')
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }
      }
      
      const url = `/api/cart/get?${params}`
      console.log('Fetching cart from:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('Cart data received:', data)
      
      if (data.success) {
        console.log('Dispatching LOAD_CART with data:', {
          items: data.cartItems,
          total: data.subtotal,
          itemCount: data.itemCount
        })
        
        dispatch({
          type: 'LOAD_CART',
          payload: {
            items: data.cartItems,
            total: data.subtotal,
            itemCount: data.itemCount
          }
        })
        console.log('Cart loaded successfully with', data.itemCount, 'items')
        console.log('Cart state after LOAD_CART dispatch:', {
          itemCount: data.itemCount,
          total: data.subtotal,
          items: data.cartItems.length
        })
      } else {
        console.log('Failed to load cart:', data.message)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error loading cart:', error)
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
      console.log('Guest user ID set, loading cart with ID:', state.guestUserId)
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
      console.log('Session detected, loading cart for authenticated user')
      loadCart()
    }
  }, [session, loadCart])

  // Reload cart when page becomes visible (handles external database changes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, reloading cart...')
        loadCart()
      }
    }

    const handleFocus = () => {
      console.log('Window focused, reloading cart...')
      loadCart()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadCart])

  // Debug: Log cart state changes
  useEffect(() => {
    console.log('Cart state changed:', {
      items: state.items,
      total: state.total,
      itemCount: state.itemCount,
      loading: state.loading,
      updating: state.updating
    })
  }, [state.items, state.total, state.itemCount, state.loading, state.updating])

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      console.log('=== ADD TO CART DEBUG ===')
      console.log('Product ID:', productId)
      console.log('Quantity:', quantity)
      console.log('Session:', session)
      console.log('Guest User ID:', state.guestUserId)
      console.log('LocalStorage guestUserId:', localStorage.getItem('guestUserId'))
      
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const requestBody: any = { productId, quantity }
      
      // Add guest user ID if not authenticated
      if (!session) {
        // Always use localStorage guest user ID if available, fallback to state
        const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
        if (guestUserId) {
          requestBody.guestUserId = guestUserId.toString()
          console.log('Sending guestUserId as:', requestBody.guestUserId, 'type:', typeof requestBody.guestUserId)
        } else {
          console.log('No guest user ID available, API will generate one')
        }
      }
      
      console.log('Request body being sent:', requestBody)
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      console.log('Add cart response:', data)
      
      if (data.success) {
        console.log('Add cart successful, showing toast and reloading cart...')
        toast.success(data.message)
        dispatch({ type: 'ADD_ITEM_SUCCESS', payload: { message: data.message } })
        
        // If API generated a new guest user ID, update our state and localStorage
        if (data.userId && !session) {
          const newGuestId = data.userId.toString()
          console.log('API returned new guest user ID:', newGuestId)
          localStorage.setItem('guestUserId', newGuestId)
          dispatch({ type: 'SET_GUEST_USER_ID', payload: newGuestId })
        }
        
        // Reload cart to get updated data
        console.log('Reloading cart after successful add...')
        await loadCart()
        console.log('Cart reload completed after add')
        console.log('Cart state after reload:', state)
      } else {
        console.log('Add cart failed:', data.message)
        toast.error(data.message)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      toast.error('Failed to add item to cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      console.log('Updating cart quantity:', { cartItemId, quantity })
      dispatch({ type: 'SET_UPDATING', payload: true })
      
      const requestBody: any = { cartItemId, quantity }
      
      // Add guest user ID if not authenticated
      if (!session) {
        const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
        if (guestUserId) {
          requestBody.guestUserId = guestUserId
        }
      }
      
      console.log('Sending update request:', requestBody)
      
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      console.log('Update response:', data)
      
      if (data.success) {
        console.log('Update successful, showing toast and reloading cart...')
        toast.success(data.message)
        dispatch({ type: 'UPDATE_ITEM_SUCCESS', payload: { message: data.message } })
        // Reload cart to get updated data
        console.log('Reloading cart after successful update...')
        await loadCart()
        console.log('Cart reload completed after update')
      } else {
        console.log('Update failed:', data.message)
        toast.error(data.message)
        dispatch({ type: 'SET_UPDATING', payload: false })
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart item')
      dispatch({ type: 'SET_UPDATING', payload: false })
    }
  }

  const removeFromCart = async (cartItemId: number) => {
    try {
      console.log('=== REMOVE FROM CART DEBUG ===')
      console.log('Cart Item ID:', cartItemId)
      console.log('Session:', session)
      console.log('State guest user ID:', state.guestUserId)
      console.log('LocalStorage guest user ID:', localStorage.getItem('guestUserId'))
      
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Build URL with guest user ID if not authenticated
      let url = `/api/cart/remove?cartItemId=${cartItemId}`
      if (!session) {
        const guestUserId = localStorage.getItem('guestUserId') || state.guestUserId
        if (guestUserId) {
          url += `&guestUserId=${guestUserId}`
          console.log('Using guest user ID for remove:', guestUserId)
        } else {
          console.log('No guest user ID available for remove')
        }
      }
      
      console.log('Remove URL:', url)
      
      const response = await fetch(url, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      console.log('Remove response:', data)
      
      if (data.success) {
        console.log('Remove successful, reloading cart...')
        toast.success(data.message)
        dispatch({ type: 'REMOVE_ITEM_SUCCESS', payload: { message: data.message } })
        // Reload cart to get updated data
        await loadCart()
        console.log('Cart reloaded after remove')
      } else {
        console.log('Remove failed:', data.message)
        toast.error(data.message)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Failed to remove item from cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

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
            console.error('Failed to remove item:', data.message)
          }
        } catch (error) {
          console.error('Error removing item:', error)
        }
      }
      
      dispatch({ type: 'CLEAR_CART_SUCCESS', payload: { message: 'Cart cleared successfully' } })
      toast.success('Cart cleared successfully')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [session, state.guestUserId, state.items])

  // Debug function to force reload cart
  const debugReloadCart = useCallback(async () => {
    console.log('=== DEBUG: Force reloading cart ===')
    console.log('Current state before reload:', state)
    console.log('Session:', session)
    console.log('Guest User ID:', state.guestUserId)
    console.log('LocalStorage guestUserId:', localStorage.getItem('guestUserId'))
    
    // Force reload
    await loadCart()
    
    console.log('=== DEBUG: Cart reload completed ===')
  }, [state, session, state.guestUserId, loadCart])

  // Force refresh cart - useful after adding items
  const forceRefreshCart = useCallback(async () => {
    console.log('=== FORCE REFRESHING CART ===')
    console.log('Current localStorage guest user ID:', localStorage.getItem('guestUserId'))
    
    // Clear any cached state and reload
    dispatch({ type: 'SET_LOADING', payload: true })
    await loadCart()
    
    console.log('=== FORCE REFRESH COMPLETED ===')
  }, [loadCart])

  // Debug function to clear localStorage and start fresh
  const debugClearLocalStorage = useCallback(() => {
    console.log('=== DEBUG: Clearing localStorage and starting fresh ===')
    console.log('Current localStorage before clear:', localStorage.getItem('guestUserId'))
    console.log('All localStorage keys:', Object.keys(localStorage))
    localStorage.removeItem('guestUserId')
    console.log('localStorage cleared, reloading page...')
    window.location.reload()
  }, [])

  // Debug function to show current guest user ID info
  const debugShowGuestId = useCallback(() => {
    console.log('=== DEBUG: Current Guest User ID Info ===')
    console.log('state.guestUserId:', state.guestUserId)
    console.log('localStorage guestUserId:', localStorage.getItem('guestUserId'))
    console.log('All localStorage keys:', Object.keys(localStorage))
    console.log('Session:', session)
  }, [state.guestUserId, session])

  // Debug function to test cart with specific guest user ID
  const debugTestCartWithGuestId = useCallback(async (testGuestId: string) => {
    console.log('=== DEBUG: Testing cart with specific guest user ID ===')
    console.log('Test guest ID:', testGuestId)
    
    // Temporarily set the guest user ID
    const originalGuestId = state.guestUserId
    dispatch({ type: 'SET_GUEST_USER_ID', payload: testGuestId })
    localStorage.setItem('guestUserId', testGuestId)
    
    // Load cart with the test ID
    await loadCart()
    
    console.log('Cart state after test:', state)
    
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
