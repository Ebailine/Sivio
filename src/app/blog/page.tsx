/**
 * Blog Page - World-Class UI
 * 5 compelling blog posts with career advice and job search strategies
 * Enhanced with Card, ScrollReveal, Button, and animations
 */

'use client'

import { useState } from 'react'
import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'
import {
  Calendar,
  User,
  ArrowRight,
  Clock,
  Tag,
  Sparkles,
  TrendingUp,
  Search,
  Mail,
  BookOpen,
} from 'lucide-react'

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Career Advice', 'Networking', 'Interviews', 'Job Search', 'Productivity']

  const featuredPost = {
    title: 'How to Land Your First Tech Internship in 2025: A Complete Guide',
    excerpt: 'Breaking into tech is harder than ever, but with the right strategy, you can land internships at top companies even with zero experience. Here\'s exactly how to do it.',
    fullExcerpt: 'The tech internship market is brutal. Students send hundreds of applications and hear nothing back. But here\'s the truth: most applicants are doing it completely wrong. This comprehensive guide reveals the exact 7-step system that helped 500+ students land internships at Google, Meta, Amazon, and Microsoft—even with no prior experience.',
    author: 'Sarah Chen',
    authorRole: 'Ex-Google Recruiter',
    date: 'January 15, 2025',
    category: 'Career Advice',
    readTime: '12 min read',
    image: '🚀',
    views: '12.5K',
    likes: '847',
  }

  const posts = [
    {
      title: 'The Cold Email Template That Gets 60% Response Rates',
      excerpt: 'Most cold emails get ignored. This template, tested with 1,000+ sends, has a 60% response rate and helped students connect with hiring managers at FAANG companies.',
      author: 'Michael Rodriguez',
      authorRole: 'Career Coach',
      date: 'January 12, 2025',
      category: 'Networking',
      readTime: '8 min read',
      image: '📧',
      views: '8.2K',
      tags: ['Email', 'Networking', 'Templates'],
    },
    {
      title: '10 Interview Questions You Should Be Asking (That Nobody Does)',
      excerpt: 'The questions you ask in interviews reveal more than your answers. These 10 questions helped students stand out and get offers from top companies.',
      author: 'Emma Thompson',
      authorRole: 'Recruiting Director',
      date: 'January 10, 2025',
      category: 'Interviews',
      readTime: '7 min read',
      image: '💼',
      views: '6.8K',
      tags: ['Interviews', 'Questions', 'Strategy'],
    },
    {
      title: 'Why Your Resume Gets Rejected (And How to Fix It)',
      excerpt: 'ATS systems reject 75% of resumes before a human ever sees them. Learn the exact formatting and keywords that get past automated screening.',
      author: 'David Park',
      authorRole: 'Resume Expert',
      date: 'January 8, 2025',
      category: 'Job Search',
      readTime: '10 min read',
      image: '📄',
      views: '15.3K',
      tags: ['Resume', 'ATS', 'Applications'],
    },
    {
      title: 'The 5-Hour Job Search: How to Apply Smarter, Not Harder',
      excerpt: 'Spending 40 hours a week applying to jobs? You\'re doing it wrong. This proven system gets more interviews with 90% less time invested.',
      author: 'Jessica Liu',
      authorRole: 'Productivity Coach',
      date: 'January 5, 2025',
      category: 'Productivity',
      readTime: '9 min read',
      image: '⚡',
      views: '10.1K',
      tags: ['Productivity', 'Strategy', 'Efficiency'],
    },
    {
      title: 'From 0 to Offer: A Student\'s Journey to Landing a Meta Internship',
      excerpt: 'No CS degree. No connections. No experience. Here\'s how one student went from rejection to a $50/hr Meta internship in 4 months.',
      author: 'Alex Kim',
      authorRole: 'Meta SWE Intern',
      date: 'January 3, 2025',
      category: 'Career Advice',
      readTime: '15 min read',
      image: '🎯',
      views: '22.7K',
      tags: ['Success Story', 'Meta', 'FAANG'],
    },
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <ParticlesBackground />

      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-pulse-glow">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Career Resources</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              Sivio <span className="text-gradient-animate">Blog</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Expert advice, proven strategies, and insider tips to help you land your dream internship
            </p>
          </ScrollReveal>

          {/* Search Bar */}
          <ScrollReveal delay={300}>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-blue-200 focus:bg-white/30 focus:outline-none transition-all"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Post */}
      <section className="relative py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-black text-gray-900">Featured Article</h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <Card className="bg-white rounded-3xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Image Placeholder */}
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 lg:p-16 flex items-center justify-center">
                  <div className="text-9xl">{featuredPost.image}</div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-semibold text-sm w-fit mb-4">
                    <Tag className="w-4 h-4" />
                    {featuredPost.category}
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">
                    {featuredPost.title}
                  </h3>

                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {featuredPost.fullExcerpt}
                  </p>

                  <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-semibold text-gray-900">{featuredPost.author}</div>
                        <div className="text-xs">{featuredPost.authorRole}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                    <span>👁️ {featuredPost.views} views</span>
                    <span>❤️ {featuredPost.likes} likes</span>
                  </div>

                  <Button variant="gradient" size="lg" href="#" className="w-fit">
                    Read Full Article
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-12">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h2 className="text-3xl font-black text-gray-900">Latest Articles</h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="h-full flex flex-col">
                  {/* Image Placeholder */}
                  <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-12 rounded-t-2xl flex items-center justify-center">
                    <div className="text-7xl">{post.image}</div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold text-xs w-fit mb-3">
                      {post.category}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 flex-1 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <div>
                            <div className="font-semibold text-gray-900 text-xs">{post.author}</div>
                            <div className="text-xs">{post.authorRole}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        👁️ {post.views} views
                      </div>

                      <button className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
              <Mail className="w-16 h-16 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl font-black mb-4">
                Never Miss an Article
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Get weekly career tips, job search strategies, and insider advice delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <Button variant="gradient" size="lg" className="bg-white text-blue-600 hover:scale-110">
                  Subscribe
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-4">Join 10,000+ students. Unsubscribe anytime.</p>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Tags Cloud */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h3 className="text-2xl font-black text-gray-900 text-center mb-8">
              Popular Topics
            </h3>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex flex-wrap justify-center gap-3">
              {['Resume Tips', 'Interview Prep', 'Networking', 'Cold Email', 'FAANG', 'Internships', 'Career Advice', 'Success Stories', 'Productivity', 'Job Search', 'Offers', 'Salary Negotiation'].map((tag) => (
                <button
                  key={tag}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-full text-sm font-semibold text-gray-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 Sivio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
