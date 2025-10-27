import { UserHeader } from '@/components/layout/UserHeader'
import { Footer } from '@/components/layout/footer'
import { ClientToaster } from '@/components/ClientToaster'

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ClientToaster />
    </div>
  )
}

