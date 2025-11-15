/**
 * Features Page
 * Comprehensive overview of Sivio's capabilities
 */

'use client'

import Link from 'next/link'
import MainNav from '@/components/MainNav'
import {
  Zap,
  Target,
  Mail,
  BarChart3,
  Brain,
  Shield,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      id: 'auto-apply',
      icon: <Zap size={32} className="text-blue-600" />,
      title: 'Auto-Apply',
      description: 'Automatically apply to hundreds of relevant internships while you sleep',
      benefits: [
        'AI-powered job matching',
        'Custom cover letters for each application',
        'One-click apply to multiple positions',
        'Application tracking & status updates',
      ],
      stats: { value: '500+', label: 'Applications per month' },
    },
    {
      id: 'contact-finder',
      icon: <Target size={32} className="text-purple-600" />,
      title: 'Contact Finder',
      description: 'Find and connect with recruiters and hiring managers at your target companies',
      benefits: [
        'Verified contact information',
        'LinkedIn profile integration',
        'Decision-maker identification',
        'Real-time data updates',
      ],
      stats: { value: '95%', label: 'Contact accuracy' },
    },
    {
      id: 'outreach',
      icon: <Mail size={32} className="text-green-600" />,
      title: 'Outreach Automation',
      description: 'Personalized email campaigns that actually get responses',
      benefits: [
        'AI-generated personalized emails',
        'Multi-step follow-up sequences',
        'A/B testing & optimization',
        'Response tracking & analytics',
      ],
      stats: { value: '3x', label: 'Higher response rate' },
    },
    {
      id: 'crm',
      icon: <BarChart3 size={32} className="text-orange-600" />,
      title: 'Smart CRM',
      description: 'Track every application, contact, and conversation in one place',
      benefits: [
        'Visual pipeline management',
        'Interview scheduling',
        'Notes & reminders',
        'Performance analytics',
      ],
      stats: { value: '10x', label: 'Better organization' },
    },
    {
      id: 'ai-matching',
      icon: <Brain size={32} className="text-pink-600" />,
      title: 'AI Job Matching',
      description: 'Machine learning algorithms find the perfect opportunities for you',
      benefits: [
        'Skills-based matching',
        'Company culture fit analysis',
        'Salary expectations alignment',
        'Career growth potential scoring',
      ],
      stats: { value: '85%', label: 'Match accuracy' },
    },
    {
      id: 'security',
      icon: <Shield size={32} className="text-indigo-600" />,
      title: 'Enterprise Security',
      description: 'Bank-level security to protect your personal information',
      benefits: [
        'End-to-end encryption',
        'SOC 2 compliance',
        'GDPR & CCPA compliant',
        'Regular security audits',
      ],
      stats: { value: '100%', label: 'Data protection' },
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
            ✨ Everything you need to succeed
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Powerful Features for
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Your Dream Career
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Sivio combines cutting-edge AI with proven job search strategies to help you land internships faster than ever before.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200">
              <div id={feature.id} className="p-8">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>

                <div className="space-y-3 mb-6">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-blue-600" />
                    <div>
                      <div className="text-3xl font-black text-blue-600">
                        {feature.stats.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        {feature.stats.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It All Works Together */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            How It All Works Together
          </h2>
          <p className="text-xl text-gray-600">
            A seamless workflow designed for maximum efficiency
          </p>
        </div>

        <div className="relative">
          {/* Timeline */}
          <div className="space-y-12">
            {[
              {
                step: 1,
                title: 'AI Discovers Opportunities',
                description: 'Our AI scans 50,000+ internship listings daily and matches you with the best fit positions based on your skills, interests, and career goals.',
                icon: <Sparkles size={24} />,
              },
              {
                step: 2,
                title: 'Auto-Apply Does the Work',
                description: 'With one click, apply to hundreds of positions with custom-tailored cover letters and optimized resumes.',
                icon: <Zap size={24} />,
              },
              {
                step: 3,
                title: 'Contact Finder Gives You an Edge',
                description: 'Get direct contact information for recruiters and hiring managers. Skip the black hole and reach decision-makers.',
                icon: <Target size={24} />,
              },
              {
                step: 4,
                title: 'Outreach Automation Follows Up',
                description: 'Personalized email sequences automatically follow up with contacts, keeping you top of mind.',
                icon: <Mail size={24} />,
              },
              {
                step: 5,
                title: 'Smart CRM Tracks Everything',
                description: 'See exactly where each application stands, schedule interviews, and manage your entire job search from one dashboard.',
                icon: <BarChart3 size={24} />,
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-blue-600">{item.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-black mb-4">
            Ready to 10x Your Job Search?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 10,000+ students who are landing internships faster with Sivio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 inline-block"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/pricing"
              className="px-10 py-5 border-2 border-white text-white rounded-2xl font-bold text-xl hover:bg-white/10 hover:scale-105 transition-all duration-200 inline-block"
            >
              View Pricing
            </Link>
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
