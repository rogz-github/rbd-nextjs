'use client'

import { useSession, signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DebugAdminFlow() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [loginData, setLoginData] = useState({
    username: 'admin',
    password: 'admin123'
  })
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  useEffect(() => {
    addLog(`Component mounted - Status: ${status}`)
    addLog(`Has session: ${!!session}`)
    
    if (session) {
      addLog(`Session user: ${JSON.stringify(session.user, null, 2)}`)
    }
  }, [session, status])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    addLog(`Starting login process with username: ${loginData.username}`)
    
    try {
      const result = await signIn('credentials', {
        usernameOrEmail: loginData.username,
        password: loginData.password,
        redirect: false,
      })
      
      addLog(`Login result: ${JSON.stringify(result, null, 2)}`)
      
      if (result?.ok) {
        addLog('Login successful! Waiting for session...')
        
        // Wait and check session multiple times
        let attempts = 0
        const checkSession = async () => {
          attempts++
          const { getSession } = await import('next-auth/react')
          const currentSession = await getSession()
          
          addLog(`Session check attempt ${attempts}: ${JSON.stringify(currentSession, null, 2)}`)
          
          if (currentSession && ((currentSession.user as any)?.isAdmin || (currentSession.user as any)?.role === 'ADMIN' || (currentSession.user as any)?.role === 'SUPER_ADMIN')) {
            addLog('✅ Session confirmed with admin privileges!')
            addLog('Redirecting to dashboard...')
            router.push('/~admin/dashboard')
            return
          }
          
          if (attempts < 10) {
            addLog(`Session not ready, waiting... (${attempts}/10)`)
            setTimeout(checkSession, 500)
          } else {
            addLog('❌ Session not established after maximum attempts')
          }
        }
        
        setTimeout(checkSession, 100)
      } else {
        addLog(`Login failed: ${result?.error}`)
      }
    } catch (error) {
      addLog(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const testMiddleware = async () => {
    addLog('Testing middleware access...')
    try {
      const response = await fetch('/api/test-middleware')
      const data = await response.json()
      addLog(`Middleware test result: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      addLog(`Middleware test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testSessionAPI = async () => {
    addLog('Testing session API...')
    try {
      const response = await fetch('/api/debug-session-detailed')
      const data = await response.json()
      addLog(`Session API result: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      addLog(`Session API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Login Flow Debugger</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  disabled={isLoggingIn}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full p-2 border rounded"
                  disabled={isLoggingIn}
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoggingIn ? 'Logging in...' : 'Test Login'}
              </button>
            </form>
          </div>

          {/* Current Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
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

        {/* Test Buttons */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test APIs</h2>
          <div className="space-x-4">
            <button
              onClick={testMiddleware}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Middleware
            </button>
            <button
              onClick={testSessionAPI}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Test Session API
            </button>
            <a
              href="/~admin/dashboard"
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Debug Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try logging in or testing APIs.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1 whitespace-pre-wrap">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
