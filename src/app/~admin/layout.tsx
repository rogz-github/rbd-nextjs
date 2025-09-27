import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './admin.css'
import { ClientToaster } from '@/components/ClientToaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Admin Portal',
    template: '%s | Admin Portal'
  },
  description: 'Admin dashboard for managing RBD E-Commerce platform',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <ClientToaster />
    </>
  )
}
