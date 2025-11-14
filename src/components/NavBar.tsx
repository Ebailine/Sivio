'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

interface NavBarProps {
  activePage: 'dashboard' | 'jobs' | 'crm'
}

export default function NavBar({ activePage }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Sivio
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`font-semibold transition-colors ${
                activePage === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/jobs"
              className={`font-semibold transition-colors ${
                activePage === 'jobs'
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Jobs
            </Link>
            <Link
              href="/crm"
              className={`font-semibold transition-colors ${
                activePage === 'crm'
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CRM
            </Link>
          </nav>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
