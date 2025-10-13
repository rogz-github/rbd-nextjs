'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/context/cart-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={true}
    >
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  )
}
