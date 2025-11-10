'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function Home() {
  const { isSignedIn, user } = useUser()
  const [dbStatus, setDbStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setDbStatus(data.success ? '✅ Database Connected!' : '❌ Connection Failed')
    } catch (error) {
      setDbStatus('❌ Connection Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          Welcome to <span className="text-blue-600">Sivio</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your AI-powered job application assistant
        </p>

        <div className="flex gap-4 justify-center mb-8">
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Go to Dashboard
              </Link>
              <p className="flex items-center text-gray-600">
                Signed in as {user.firstName}
              </p>
            </>
          ) : (
            <>
              <Link href="/sign-up" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Get Started
              </Link>
              <Link href="/sign-in" className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Database Test Section */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <button
            onClick={testDatabase}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </button>
          {dbStatus && (
            <p className="mt-4 text-lg font-semibold">{dbStatus}</p>
          )}
        </div>
      </div>
    </main>
  )
}
