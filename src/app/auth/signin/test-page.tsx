'use client'

export default function TestSignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Test Sign In Page</h1>
        <p className="text-gray-600 text-center">This is a simple test to see if the page renders.</p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800">✅ Page is rendering correctly!</p>
        </div>
      </div>
    </div>
  )
}
