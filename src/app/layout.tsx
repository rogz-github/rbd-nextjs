import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'
import { UserHeader } from '@/components/layout/UserHeader'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://rbd-ecommerce.com"
  ),
  title: {
    default: 'RBD E-Commerce - Premium Online Shopping',
    template: '%s | RBD E-Commerce'
  },
  description: 'Discover amazing products at great prices. Fast shipping, secure checkout, and excellent customer service.',
  keywords: ['ecommerce', 'online shopping', 'products', 'fashion', 'electronics', 'home', 'lifestyle'],
  authors: [{ name: 'RBD E-Commerce' }],
  creator: 'RBD E-Commerce',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rbd-ecommerce.com',
    title: 'RBD E-Commerce - Premium Online Shopping',
    description: 'Discover amazing products at great prices. Fast shipping, secure checkout, and excellent customer service.',
    siteName: 'RBD E-Commerce',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RBD E-Commerce - Premium Online Shopping',
    description: 'Discover amazing products at great prices. Fast shipping, secure checkout, and excellent customer service.',
    creator: '@rbdecommerce',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
