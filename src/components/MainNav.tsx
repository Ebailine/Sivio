/**
 * MainNav Component
 * Professional SaaS navigation - SIMPLIFIED (no framer-motion)
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser, UserButton } from '@clerk/nextjs'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function MainNav() {
  const { isSignedIn } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (dropdown: string) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
    setOpenDropdown(dropdown)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenDropdown(null)
    }, 150) // 150ms delay to allow mouse to move into dropdown
    setCloseTimeout(timeout)
  }

  const handleDropdownEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <nav className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              Sivio
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Product Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => handleMouseEnter('product')}
                onMouseLeave={handleMouseLeave}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Product
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'product' ? 'rotate-180' : ''}`} />
              </button>

              {/* Hover bridge - invisible div between button and dropdown */}
              {openDropdown === 'product' && (
                <div className="absolute top-full left-0 right-0 h-2" onMouseEnter={handleDropdownEnter} />
              )}

              {openDropdown === 'product' && (
                <div
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 animate-fadeIn z-[100]"
                >
                  <Link href="/features" className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-semibold text-gray-900">Features</div>
                    <div className="text-sm text-gray-600">See what Sivio can do</div>
                  </Link>
                  <Link href="/pricing" className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-semibold text-gray-900">Pricing</div>
                    <div className="text-sm text-gray-600">Plans for every student</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => handleMouseEnter('solutions')}
                onMouseLeave={handleMouseLeave}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Solutions
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'solutions' ? 'rotate-180' : ''}`} />
              </button>

              {/* Hover bridge */}
              {openDropdown === 'solutions' && (
                <div className="absolute top-full left-0 right-0 h-2" onMouseEnter={handleDropdownEnter} />
              )}

              {openDropdown === 'solutions' && (
                <div
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 animate-fadeIn z-[100]"
                >
                  <Link href="/jobs" className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-semibold text-gray-900">Browse Jobs</div>
                    <div className="text-sm text-gray-600">50,000+ internships</div>
                  </Link>
                  <Link href="/crm" className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-semibold text-gray-900">CRM</div>
                    <div className="text-sm text-gray-600">Track applications</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => handleMouseEnter('resources')}
                onMouseLeave={handleMouseLeave}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>

              {/* Hover bridge */}
              {openDropdown === 'resources' && (
                <div className="absolute top-full left-0 right-0 h-2" onMouseEnter={handleDropdownEnter} />
              )}

              {openDropdown === 'resources' && (
                <div
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 animate-fadeIn z-[100]"
                >
                  <Link href="/blog" className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-semibold text-gray-900">Blog</div>
                    <div className="text-sm text-gray-600">Tips & insights</div>
                  </Link>
                  <Link href="/help" className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-semibold text-gray-900">Help Center</div>
                    <div className="text-sm text-gray-600">Get support</div>
                  </Link>
                  <Link href="/changelog" className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-semibold text-gray-900">Changelog</div>
                    <div className="text-sm text-gray-600">Latest updates</div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/pricing" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              About
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link href="/sign-in" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                  Log In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 animate-slideDown">
            <div className="flex flex-col gap-4">
              <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600">
                Features
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600">
                Pricing
              </Link>
              <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600">
                Browse Jobs
              </Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600">
                Blog
              </Link>
              <Link href="/help" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600">
                Help
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600">
                About
              </Link>
              {!isSignedIn && (
                <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="text-center font-semibold text-gray-700 hover:text-blue-600">
                    Log In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    Start Free Trial
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
