/**
 * Blog Page
 * Career advice and tips for students
 */

'use client'

import MainNav from '@/components/MainNav'
import { Calendar, User, ArrowRight } from 'lucide-react'

export default function BlogPage() {
  const posts = [
    {
      title: 'How to Land Your First Tech Internship in 2025',
      excerpt: 'A comprehensive guide to breaking into the tech industry with no prior experience.',
      author: 'Sarah Chen',
      date: 'January 15, 2025',
      category: 'Career Advice',
      readTime: '8 min read',
      image: '🚀',
    },
    {
      title: 'The Art of the Cold Email: Templates That Get Responses',
      excerpt: 'Learn the exact email templates that have helped students connect with hiring managers.',
      author: 'Michael Rodriguez',
      date: 'January 12, 2025',
      category: 'Networking',
      readTime: '6 min read',
      image: '📧',
    },
    {
      title: 'Interview Prep: Questions You Should Be Asking',
      excerpt: 'Stand out in interviews by asking these thoughtful questions that show you\'re serious.',
      author: 'Emma Thompson',
      date: 'January 10, 2025',
      category: 'Interviews',
      readTime: '5 min read',
      image: '💼',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Career Insights
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
            Tips, strategies, and advice to help you land your dream internship
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200">
              <div className="p-8">
                <div className="text-6xl mb-4">{post.image}</div>
                <div className="text-sm font-semibold text-blue-600 mb-2">
                  {post.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-6">{post.excerpt}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{post.date}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-6">{post.readTime}</div>

                <button className="flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                  Read More <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="text-center mt-12 bg-white rounded-2xl p-12 shadow-sm border border-gray-200/50">
          <p className="text-gray-600 text-lg">
            📝 More articles coming soon! Subscribe to our newsletter to stay updated.
          </p>
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
