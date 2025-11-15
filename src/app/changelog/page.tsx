/**
 * Changelog Page - World-Class UI
 * Product updates and releases with 12+ realistic entries
 * Enhanced with TiltCard, ScrollReveal, Button, and animations
 */

'use client'

import { useState } from 'react'
import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { TiltCard } from '@/components/ui/TiltCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'
import {
  Sparkles,
  Zap,
  Bug,
  Package,
  ArrowRight,
  Mail,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Rocket,
} from 'lucide-react'

export default function ChangelogPage() {
  const [filter, setFilter] = useState('all')

  const updates = [
    {
      version: '2.2.0',
      date: 'January 20, 2025',
      type: 'major',
      title: 'AI Outreach & Email Sequences',
      description: 'Major update bringing AI-powered email generation and multi-step follow-up sequences',
      changes: [
        { type: 'feature', text: 'AI Outreach: Generate personalized emails to recruiters with 60% response rate' },
        { type: 'feature', text: 'Email Sequences: Multi-step follow-ups with smart timing' },
        { type: 'feature', text: 'Response Tracking: See who opened and clicked your emails' },
        { type: 'improvement', text: 'Contact Finder now includes direct phone numbers (Pro feature)' },
        { type: 'improvement', text: 'CRM pipeline now tracks email outreach stage' },
        { type: 'fix', text: 'Fixed timezone issues with scheduled follow-ups' },
      ],
    },
    {
      version: '2.1.0',
      date: 'January 15, 2025',
      type: 'major',
      title: 'Enhanced CRM & Contact Reasoner',
      description: 'Smarter contact matching and visual pipeline management',
      changes: [
        { type: 'feature', text: 'AI Contact Reasoner: Automatically finds the best contact for each role' },
        { type: 'feature', text: 'Visual Pipeline: Drag-and-drop applications between stages' },
        { type: 'feature', text: 'Interview Scheduler: Set reminders for upcoming interviews' },
        { type: 'improvement', text: 'Job search indexing 3x faster' },
        { type: 'improvement', text: 'CRM now supports bulk actions (archive, delete, move)' },
        { type: 'fix', text: 'Fixed duplicate applications appearing in different stages' },
      ],
    },
    {
      version: '2.0.0',
      date: 'January 1, 2025',
      type: 'major',
      title: 'Complete UI Redesign',
      description: 'Modern glassmorphism design, advanced filters, and outreach automation',
      changes: [
        { type: 'feature', text: 'Complete UI redesign with glassmorphism and modern aesthetics' },
        { type: 'feature', text: 'Advanced job filters: salary range, remote/hybrid/in-person, company size' },
        { type: 'feature', text: 'Outreach automation foundation (email sequences coming in v2.2)' },
        { type: 'improvement', text: 'Auto-apply success rate improved by 40% with better form filling' },
        { type: 'improvement', text: 'Mobile responsiveness overhauled for better experience' },
        { type: 'fix', text: 'Fixed Safari rendering issues with gradient backgrounds' },
      ],
    },
    {
      version: '1.9.0',
      date: 'December 15, 2024',
      type: 'minor',
      title: 'LinkedIn Integration',
      description: 'Contact Finder now searches LinkedIn for verified contacts',
      changes: [
        { type: 'feature', text: 'LinkedIn integration: Find contacts directly from company LinkedIn pages' },
        { type: 'feature', text: 'Email verification: 85% accuracy rate for found contacts' },
        { type: 'improvement', text: 'Mobile app now supports dark mode' },
        { type: 'improvement', text: 'Job alerts can now be customized per saved search' },
        { type: 'fix', text: 'Fixed email template variables not populating correctly' },
      ],
    },
    {
      version: '1.8.0',
      date: 'December 1, 2024',
      type: 'minor',
      title: 'Auto-Apply Beta Launch',
      description: 'Closed beta for auto-apply feature with 50 selected students',
      changes: [
        { type: 'feature', text: 'Auto-Apply Beta: Automatically submit applications with AI-generated cover letters' },
        { type: 'feature', text: 'Application Templates: Save common application questions for reuse' },
        { type: 'improvement', text: 'Job matching algorithm now considers company culture fit' },
        { type: 'improvement', text: 'CRM performance: 50% faster loading for users with 100+ applications' },
        { type: 'fix', text: 'Fixed issue where some jobs showed incorrect location' },
      ],
    },
    {
      version: '1.7.0',
      date: 'November 15, 2024',
      type: 'minor',
      title: 'Contact Finder Launch (Pro)',
      description: 'Find recruiter and hiring manager emails for direct outreach',
      changes: [
        { type: 'feature', text: 'Contact Finder: Search for recruiter emails by company and role' },
        { type: 'feature', text: 'Pro Plan introduced: $29/mo with Contact Finder and unlimited applications' },
        { type: 'improvement', text: 'Job search now includes company ratings and reviews' },
        { type: 'improvement', text: 'Application tracking shows time since last update' },
        { type: 'fix', text: 'Fixed CRM not syncing across multiple devices' },
      ],
    },
    {
      version: '1.6.0',
      date: 'November 1, 2024',
      type: 'minor',
      title: 'Advanced CRM Features',
      description: 'Notes, reminders, and custom tags for better application tracking',
      changes: [
        { type: 'feature', text: 'CRM Notes: Add detailed notes to any application' },
        { type: 'feature', text: 'Reminders: Set follow-up reminders for applications' },
        { type: 'feature', text: 'Custom Tags: Organize applications with custom labels' },
        { type: 'improvement', text: 'Search now supports filtering by date posted' },
        { type: 'fix', text: 'Fixed bug where applications could be saved multiple times' },
      ],
    },
    {
      version: '1.5.0',
      date: 'October 15, 2024',
      type: 'minor',
      title: 'Job Alerts & Saved Searches',
      description: 'Never miss a new job posting with email and in-app alerts',
      changes: [
        { type: 'feature', text: 'Job Alerts: Get daily emails for new jobs matching your saved searches' },
        { type: 'feature', text: 'Saved Searches: Save your favorite search filters for quick access' },
        { type: 'improvement', text: 'Job descriptions now show estimated time to apply' },
        { type: 'improvement', text: 'Dashboard shows stats: total applications, interview rate, offers' },
        { type: 'fix', text: 'Fixed email notifications not respecting user preferences' },
      ],
    },
    {
      version: '1.4.0',
      date: 'October 1, 2024',
      type: 'minor',
      title: 'Application CRM Launch',
      description: 'Track all your applications in one visual pipeline',
      changes: [
        { type: 'feature', text: 'Application CRM: Visual Kanban board to track application stages' },
        { type: 'feature', text: 'Application Stages: Applied, Interviewing, Offer, Accepted, Rejected' },
        { type: 'feature', text: 'Quick Actions: Move applications between stages with drag-and-drop' },
        { type: 'improvement', text: 'Job search now shows "Recently Applied" badge for already-applied jobs' },
      ],
    },
    {
      version: '1.3.0',
      date: 'September 15, 2024',
      type: 'minor',
      title: 'AI Job Matching',
      description: 'Smart recommendations based on your skills and preferences',
      changes: [
        { type: 'feature', text: 'AI Matching: Get a 0-100% fit score for every job' },
        { type: 'feature', text: 'Personalized Dashboard: See your best matches on login' },
        { type: 'improvement', text: 'Job search now supports sorting by match score' },
        { type: 'improvement', text: 'Profile completeness indicator helps improve recommendations' },
        { type: 'fix', text: 'Fixed incorrect salary ranges showing for some jobs' },
      ],
    },
    {
      version: '1.2.0',
      date: 'September 1, 2024',
      type: 'minor',
      title: 'Advanced Search Filters',
      description: 'Filter jobs by location, salary, remote/in-person, and more',
      changes: [
        { type: 'feature', text: 'Location Filter: Search by city, state, or remote' },
        { type: 'feature', text: 'Salary Filter: Set minimum salary requirements' },
        { type: 'feature', text: 'Company Size Filter: Startups, mid-size, or enterprise' },
        { type: 'improvement', text: 'Job cards now show key details at a glance' },
        { type: 'fix', text: 'Fixed pagination not working correctly beyond page 10' },
      ],
    },
    {
      version: '1.0.0',
      date: 'August 15, 2024',
      type: 'major',
      title: 'Sivio Launch! 🎉',
      description: 'Initial release with job search and application tracking',
      changes: [
        { type: 'feature', text: 'Job Search: Browse 50,000+ internship listings' },
        { type: 'feature', text: 'User Profiles: Upload resume and set preferences' },
        { type: 'feature', text: 'Application Tracking: Track where you\'ve applied' },
        { type: 'feature', text: 'Email Support: Get help from our team' },
      ],
    },
  ]

  const filteredUpdates = updates.filter((update) => {
    if (filter === 'all') return true
    return update.changes.some((change) => change.type === filter)
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles size={18} className="text-green-600" />
      case 'improvement':
        return <Zap size={18} className="text-blue-600" />
      case 'fix':
        return <Bug size={18} className="text-orange-600" />
      default:
        return <Package size={18} className="text-gray-600" />
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

  const stats = [
    { label: 'Total Updates', value: updates.length },
    { label: 'Features Shipped', value: updates.reduce((sum, u) => sum + u.changes.filter(c => c.type === 'feature').length, 0) },
    { label: 'Improvements', value: updates.reduce((sum, u) => sum + u.changes.filter(c => c.type === 'improvement').length, 0) },
    { label: 'Bugs Fixed', value: updates.reduce((sum, u) => sum + u.changes.filter(c => c.type === 'fix').length, 0) },
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
              <Rocket className="w-5 h-5" />
              <span className="font-semibold">Product Updates</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              What's <span className="text-gradient-animate">New</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              See what we've been building. New features, improvements, and fixes shipped every week.
            </p>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={300}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-4xl font-black mb-2">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filter */}
      <section className="relative py-8 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Updates
              </button>
              <button
                onClick={() => setFilter('feature')}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  filter === 'feature'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sparkles size={16} />
                Features
              </button>
              <button
                onClick={() => setFilter('improvement')}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  filter === 'improvement'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap size={16} />
                Improvements
              </button>
              <button
                onClick={() => setFilter('fix')}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  filter === 'fix'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bug size={16} />
                Fixes
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Updates Timeline */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="space-y-8">
            {filteredUpdates.map((update, index) => (
              <ScrollReveal key={update.version} delay={index * 50}>
                <TiltCard className="bg-white">
                  {/* Header */}
                  <div className="p-8 pb-6">
                    <div className="flex items-start justify-between mb-4">
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
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <Calendar size={16} />
                          <span className="text-sm">{update.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {update.title}
                        </h3>
                        <p className="text-gray-600">
                          {update.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Changes List */}
                  <div className="px-8 pb-8">
                    <div className="space-y-3">
                      {update.changes.map((change, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="mt-1">{getTypeIcon(change.type)}</div>
                          <div className="flex-1">
                            <span className="font-bold text-sm text-gray-600 mr-2">
                              {getTypeLabel(change.type)}:
                            </span>
                            <span className="text-gray-900">{change.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="relative py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <TiltCard className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
              <TrendingUp className="w-16 h-16 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl font-black mb-4">
                Stay in the Loop
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Get notified about new features, improvements, and product updates
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <Button variant="gradient" size="lg" className="bg-white text-blue-600 hover:scale-110">
                  Subscribe
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-4">Join 10,000+ students. Unsubscribe anytime.</p>
            </TiltCard>
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
