/**
 * MainNav Component
 * Professional SaaS navigation with dropdown menus
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useUser, UserButton } from '@clerk/nextjs'
import { MotionDiv, AnimatePresence } from '@/components/ui/Motion'
import { ClientOnly } from '@/components/ui/ClientOnly'
import {
  ChevronDown,
  Zap,
  Target,
  Users,
  BarChart3,
  Mail,
  BookOpen,
  HelpCircle,
  FileText,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'

interface DropdownItem {
  label: string
  href: string
  description: string
  icon: React.ReactNode
}

interface DropdownMenu {
  label: string
  items: DropdownItem[]
}

export default function MainNav() {
  const { isSignedIn } = useUser()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dropdownMenus: { [key: string]: DropdownMenu } = {
    product: {
      label: 'Product',
      items: [
        {
          label: 'Auto-Apply',
          href: '/features#auto-apply',
          description: 'Automated job applications',
          icon: <Zap size={20} className="text-blue-600" />,
        },
        {
          label: 'Contact Finder',
          href: '/features#contact-finder',
          description: 'Find recruiters & hiring managers',
          icon: <Target size={20} className="text-purple-600" />,
        },
        {
          label: 'Smart CRM',
          href: '/crm',
          description: 'Track your applications',
          icon: <BarChart3 size={20} className="text-green-600" />,
        },
        {
          label: 'Outreach Automation',
          href: '/features#outreach',
          description: 'Automated email campaigns',
          icon: <Mail size={20} className="text-orange-600" />,
        },
      ],
    },
    solutions: {
      label: 'Solutions',
      items: [
        {
          label: 'For Students',
          href: '/solutions/students',
          description: 'Land your dream internship',
          icon: <Users size={20} className="text-blue-600" />,
        },
        {
          label: 'For Universities',
          href: '/solutions/universities',
          description: 'Career services platform',
          icon: <Sparkles size={20} className="text-purple-600" />,
        },
      ],
    },
    resources: {
      label: 'Resources',
      items: [
        {
          label: 'Blog',
          href: '/blog',
          description: 'Career advice & tips',
          icon: <BookOpen size={20} className="text-blue-600" />,
        },
        {
          label: 'Help Center',
          href: '/help',
          description: 'Get support',
          icon: <HelpCircle size={20} className="text-purple-600" />,
        },
        {
          label: 'Changelog',
          href: '/changelog',
          description: 'Latest updates',
          icon: <FileText size={20} className="text-green-600" />,
        },
      ],
    },
  }

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <nav ref={navRef} className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              Sivio
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Dropdown Menus */}
            {Object.entries(dropdownMenus).map(([key, menu]) => (
              <div key={key} className="relative">
                <button
                  onClick={() => toggleDropdown(key)}
                  onMouseEnter={() => setActiveDropdown(key)}
                  className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {menu.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      activeDropdown === key ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <ClientOnly>
                  <AnimatePresence>
                    {activeDropdown === key && (
                      <MotionDiv
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                      <div className="p-2">
                        {menu.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="mt-0.5">{item.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {item.label}
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5">
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </MotionDiv>
                    )}
                  </AnimatePresence>
                </ClientOnly>
              </div>
            ))}

            {/* Direct Links */}
            <Link
              href="/pricing"
              className="font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
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
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <ClientOnly>
          <AnimatePresence>
            {mobileMenuOpen && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
              <div className="py-4 space-y-2">
                {/* Mobile Dropdowns */}
                {Object.entries(dropdownMenus).map(([key, menu]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <button
                      onClick={() => toggleDropdown(key)}
                      className="w-full flex items-center justify-between py-3 font-semibold text-gray-900"
                    >
                      {menu.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          activeDropdown === key ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <ClientOnly>
                      <AnimatePresence>
                        {activeDropdown === key && (
                          <MotionDiv
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1 pl-4"
                          >
                          {menu.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-2 py-2 text-gray-700"
                              onClick={() => {
                                setMobileMenuOpen(false)
                                setActiveDropdown(null)
                              }}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </MotionDiv>
                        )}
                      </AnimatePresence>
                    </ClientOnly>
                  </div>
                ))}

                {/* Mobile Direct Links */}
                <Link
                  href="/pricing"
                  className="block py-3 font-semibold text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  className="block py-3 font-semibold text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>

                {/* Mobile Auth Buttons */}
                {!isSignedIn && (
                  <div className="pt-4 space-y-2">
                    <Link
                      href="/sign-in"
                      className="block w-full text-center py-3 font-semibold text-gray-900 border border-gray-300 rounded-xl"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Start Free Trial
                    </Link>
                  </div>
                )}
              </div>
            </MotionDiv>
            )}
          </AnimatePresence>
        </ClientOnly>
      </nav>
    </header>
  )
}
