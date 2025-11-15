/**
 * About Page
 * Learn about Sivio's mission and team
 */

'use client'

import Link from 'next/link'
import MainNav from '@/components/MainNav'
import { Target, Heart, Zap, Users } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: <Target size={32} className="text-blue-600" />,
      title: 'Student-First',
      description: 'Every feature we build starts with asking: "Will this help students land their dream internship?"',
    },
    {
      icon: <Heart size={32} className="text-purple-600" />,
      title: 'Empathy-Driven',
      description: 'We understand the stress of job searching. Our platform is designed to reduce anxiety and boost confidence.',
    },
    {
      icon: <Zap size={32} className="text-green-600" />,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI and automation to give students an unfair advantage in the job market.',
    },
    {
      icon: <Users size={32} className="text-orange-600" />,
      title: 'Community',
      description: 'Success is better together. We\'re building a community of ambitious students helping each other succeed.',
    },
  ]

  const stats = [
    { value: '10,000+', label: 'Active Students' },
    { value: '500,000+', label: 'Applications Submitted' },
    { value: '85%', label: 'Interview Rate' },
    { value: '$75K', label: 'Avg Starting Salary' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            We're on a Mission to
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Democratize Career Success
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Every student deserves access to the same tools and opportunities as those with connections. We're leveling the playing field.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-[900px] mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-200/50">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              Sivio was born from a simple frustration: the job search process is broken.
            </p>
            <p className="text-gray-700 mb-4">
              As college students ourselves, we watched talented peers spend 5+ hours daily applying to hundreds of jobs, only to face rejection after rejection. The problem wasn't their qualifications—it was the system.
            </p>
            <p className="text-gray-700 mb-4">
              Traditional job boards are black holes. Applications disappear without a trace. Response rates hover around 2%. Students with connections get interviews, while equally talented students without networks get ignored.
            </p>
            <p className="text-gray-700">
              We built Sivio to fix this. By combining automation, AI, and strategic outreach, we give every student—regardless of their network—the tools to compete and win in today's competitive job market.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <h2 className="text-4xl font-black text-gray-900 text-center mb-12">
          Our Values
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200">
              <div className="p-8">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-black mb-4">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Help us create a world where every talented student can land their dream job
          </p>
          <Link
            href="/sign-up"
            className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 inline-block"
          >
            Get Started Free
          </Link>
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
