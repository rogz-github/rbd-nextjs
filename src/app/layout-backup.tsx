import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './critical.css'
import './globals.css'
import { Providers } from '@/components/providers'
// import { ThemeProvider } from '@/contexts/ThemeContext'
// import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { ClientToaster } from '@/components/ClientToaster'

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

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
  // Performance optimizations
  other: {
    'X-DNS-Prefetch-Control': 'on',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/logo/ready-logo.webp" as="image" type="image/webp" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Service Worker Registration - Temporarily disabled */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        /> */}
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <ClientToaster />
        </Providers>
      </body>
    </html>
  )
}
