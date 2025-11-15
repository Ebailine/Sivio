/**
 * Help Center Page
 * Support resources and documentation
 */

'use client'

import { useState } from 'react'
import MainNav from '@/components/MainNav'
import { Search, BookOpen, MessageSquare, Video, FileText } from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    {
      icon: <BookOpen size={32} className="text-blue-600" />,
      title: 'Getting Started',
      articles: 5,
      description: 'Learn the basics of using Sivio',
    },
    {
      icon: <FileText size={32} className="text-purple-600" />,
      title: 'Features & Tools',
      articles: 12,
      description: 'Deep dive into our features',
    },
    {
      icon: <MessageSquare size={32} className="text-green-600" />,
      title: 'Best Practices',
      articles: 8,
      description: 'Tips for maximum success',
    },
    {
      icon: <Video size={32} className="text-orange-600" />,
      title: 'Video Tutorials',
      articles: 6,
      description: 'Watch and learn',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            How can we help?
          </h1>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <button
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left"
            >
              <div className="mb-4">{category.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              <span className="text-blue-600 font-semibold text-sm">
                {category.articles} articles →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Popular Articles */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-gray-900 mb-8">Popular Articles</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 divide-y divide-gray-200">
          {[
            'How do I start my first auto-apply campaign?',
            'What information do I need to find contacts?',
            'How does the CRM tracking work?',
            'Can I customize my outreach emails?',
            'How do I upgrade or downgrade my plan?',
          ].map((article, index) => (
            <button
              key={index}
              className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
              <span className="font-semibold text-gray-900">{article}</span>
              <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-black mb-4">
            Still need help?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our support team is here for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Contact Support
            </a>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-200">
              Live Chat
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
