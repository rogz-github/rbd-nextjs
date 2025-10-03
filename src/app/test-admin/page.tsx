'use client'

import { useSession, signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function TestAdmin() {
  const { data: session, status } = useSession()
  const [loginData, setLoginData] = useState({
    username: 'admin',
    password: 'admin123'
  })
  const [loginResult, setLoginResult] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🧪 Test login with:', loginData)
    
    try {
      const result = await signIn('credentials', {
        usernameOrEmail: loginData.username,
        password: loginData.password,
        redirect: false,
      })
      
      console.log('🧪 Login result:', result)
      setLoginResult(result)
      
      if (result?.ok) {
        // Wait a bit and check session
        setTimeout(async () => {
          const { getSession } = await import('next-auth/react')
          const newSession = await getSession()
          console.log('🧪 Session after login:', newSession)
        }, 1000)
      }
    } catch (error) {
      console.error('🧪 Login error:', error)
      setLoginResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Login Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Test Login
              </button>
            </form>
          </div>

          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
              {session && (
                <>
                  <p><strong>User ID:</strong> {(session.user as any)?.id}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Role:</strong> {(session.user as any)?.role}</p>
                  <p><strong>Is Admin:</strong> {(session.user as any)?.isAdmin ? 'Yes' : 'No'}</p>
                  <p><strong>Username:</strong> {(session.user as any)?.username}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Login Result */}
        {loginResult && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Login Result</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(loginResult, null, 2)}
            </pre>
          </div>
        )}

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
