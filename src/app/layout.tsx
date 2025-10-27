import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import CustomCodeWrapper from '@/components/CustomCodeWrapper'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RBD E-Commerce',
  description: 'Premium online shopping experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <CustomCodeWrapper location="head" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <CustomCodeWrapper location="body" />
      </body>
    </html>
  )
}
