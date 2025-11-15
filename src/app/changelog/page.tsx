/**
 * Changelog Page
 * Product updates and releases
 */

import MainNav from '@/components/MainNav'
import { Sparkles, Zap, Bug, Package } from 'lucide-react'

export default function ChangelogPage() {
  const updates = [
    {
      version: '2.1.0',
      date: 'January 15, 2025',
      type: 'major',
      changes: [
        { type: 'feature', text: 'New AI-powered contact reasoner for better contact matching' },
        { type: 'feature', text: 'Enhanced CRM with visual pipeline management' },
        { type: 'improvement', text: 'Faster job search with improved indexing' },
        { type: 'fix', text: 'Fixed issue with duplicate applications' },
      ],
    },
    {
      version: '2.0.0',
      date: 'January 1, 2025',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Complete UI redesign with modern glassmorphism' },
        { type: 'feature', text: 'Outreach automation with email sequences' },
        { type: 'feature', text: 'Advanced filtering on Browse Jobs page' },
        { type: 'improvement', text: 'Improved auto-apply success rate by 40%' },
      ],
    },
    {
      version: '1.9.0',
      date: 'December 15, 2024',
      type: 'minor',
      changes: [
        { type: 'feature', text: 'LinkedIn integration for contact finder' },
        { type: 'improvement', text: 'Better mobile responsiveness' },
        { type: 'fix', text: 'Fixed email template variables' },
      ],
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles size={16} className="text-green-600" />
      case 'improvement':
        return <Zap size={16} className="text-blue-600" />
      case 'fix':
        return <Bug size={16} className="text-orange-600" />
      default:
        return <Package size={16} className="text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return 'New'
      case 'improvement':
        return 'Improved'
      case 'fix':
        return 'Fixed'
      default:
        return 'Changed'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
            🚀 Product Updates
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Changelog
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
            See what's new, improved, and fixed in Sivio
          </p>
        </div>
      </section>

      {/* Updates */}
      <section className="max-w-[900px] mx-auto px-6 py-16">
        <div className="space-y-12">
          {updates.map((update, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/50"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-black text-gray-900">
                      v{update.version}
                    </h2>
                    {update.type === 'major' && (
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full">
                        MAJOR
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{update.date}</p>
                </div>
              </div>

              <div className="space-y-3">
                {update.changes.map((change, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1">{getTypeIcon(change.type)}</div>
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-gray-600 mr-2">
                        {getTypeLabel(change.type)}:
                      </span>
                      <span className="text-gray-900">{change.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white">
          <h3 className="text-2xl font-black mb-2">
            Stay Updated
          </h3>
          <p className="text-blue-100 mb-6">
            Get notified about new features and improvements
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 outline-none"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 Sivio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
