'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugSession() {
  const { data: session, status } = useSession()
  const [serverSession, setServerSession] = useState<any>(null)

  useEffect(() => {
    const fetchServerSession = async () => {
      try {
        const response = await fetch('/api/debug-session-detailed')
        const data = await response.json()
        setServerSession(data)
      } catch (error) {
        console.error('Error fetching server session:', error)
      }
    }

    fetchServerSession()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Session */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Client Session (useSession)</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
              {session && (
                <>
                  <p><strong>User ID:</strong> {(session.user as any)?.id}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Name:</strong> {session.user?.name}</p>
                  <p><strong>Role:</strong> {(session.user as any)?.role}</p>
                  <p><strong>Is Admin:</strong> {(session.user as any)?.isAdmin ? 'Yes' : 'No'}</p>
                  <p><strong>Is Super Admin:</strong> {(session.user as any)?.isSuperAdmin ? 'Yes' : 'No'}</p>
                  <p><strong>Username:</strong> {(session.user as any)?.username}</p>
                </>
              )}
            </div>
          </div>

          {/* Server Session */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Server Session (getServerSession)</h2>
            {serverSession ? (
              <div className="space-y-2">
                <p><strong>Success:</strong> {serverSession.success ? 'Yes' : 'No'}</p>
                <p><strong>Has User:</strong> {serverSession.hasUser ? 'Yes' : 'No'}</p>
                <p><strong>Is Admin:</strong> {serverSession.isAdmin ? 'Yes' : 'No'}</p>
                <p><strong>User Role:</strong> {serverSession.userRole}</p>
                {serverSession.adminChecks && (
                  <>
                    <p><strong>Admin by Role:</strong> {serverSession.adminChecks.isAdminByRole ? 'Yes' : 'No'}</p>
                    <p><strong>Admin by Property:</strong> {serverSession.adminChecks.isAdminByProperty ? 'Yes' : 'No'}</p>
                    <p><strong>Should Have Access:</strong> {serverSession.adminChecks.shouldHaveAccess ? 'Yes' : 'No'}</p>
                  </>
                )}
              </div>
            ) : (
              <p>Loading server session...</p>
            )}
          </div>
        </div>

        {/* Raw Data */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ client: session, server: serverSession }, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <a 
              href="/~admin" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Admin Login
            </a>
            <a 
              href="/~admin/dashboard" 
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Admin Dashboard
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
