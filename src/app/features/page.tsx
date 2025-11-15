/**
 * Features Page - World-Class UI
 * Comprehensive overview of Sivio's capabilities
 * Enhanced with TiltCard, ScrollReveal, animations, and status badges
 */

'use client'

import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { TiltCard } from '@/components/ui/TiltCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'
import {
  Zap,
  Target,
  Mail,
  BarChart3,
  Brain,
  Shield,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Users,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      id: 'ai-matching',
      icon: <Brain className="w-12 h-12 text-blue-600" />,
      title: 'AI Job Matching',
      description: 'Our AI analyzes 50,000+ internship listings daily and surfaces perfect matches based on your profile, skills, and preferences. Get notified the moment your dream job is posted.',
      benefits: [
        'Skills-based matching algorithm',
        'Company culture fit analysis',
        'Salary expectations alignment',
        'Real-time job alerts',
      ],
      stats: { value: '10x', label: 'Faster job discovery' },
      status: 'Live',
      statusColor: 'bg-green-500',
      image: '🎯', // Placeholder - will use actual mockup
    },
    {
      id: 'auto-apply',
      icon: <Zap className="w-12 h-12 text-purple-600" />,
      title: 'One-Click Auto-Apply',
      description: 'Apply to hundreds of relevant positions with custom-tailored cover letters and optimized resumes. Our AI customizes each application to maximize your chances.',
      benefits: [
        'AI-generated cover letters',
        'Resume optimization per job',
        'Bulk application submission',
        'Application tracking',
      ],
      stats: { value: '200+', label: 'Applications per day' },
      status: 'Coming Soon',
      statusColor: 'bg-amber-500',
      image: '⚡',
    },
    {
      id: 'contact-finder',
      icon: <Target className="w-12 h-12 text-green-600" />,
      title: 'Contact Finder',
      description: 'Find verified email addresses and LinkedIn profiles of recruiters and hiring managers at target companies. Skip the black hole and reach decision-makers directly.',
      benefits: [
        '95% email accuracy rate',
        'LinkedIn integration',
        'Decision-maker identification',
        'Contact enrichment',
      ],
      stats: { value: '85%', label: 'Email accuracy' },
      status: 'Coming Soon',
      statusColor: 'bg-amber-500',
      image: '👥',
    },
    {
      id: 'outreach',
      icon: <Mail className="w-12 h-12 text-pink-600" />,
      title: 'AI-Powered Outreach',
      description: 'Generate personalized emails that actually get responses. Our AI writes custom messages based on company research, job details, and your unique value proposition.',
      benefits: [
        'Personalized email generation',
        'Multi-step follow-up sequences',
        'A/B testing optimization',
        'Response tracking',
      ],
      stats: { value: '60%', label: 'Response rate' },
      status: 'Coming Soon',
      statusColor: 'bg-amber-500',
      image: '📧',
    },
    {
      id: 'crm',
      icon: <BarChart3 className="w-12 h-12 text-orange-600" />,
      title: 'Application CRM',
      description: 'Track every application, contact, and conversation in one beautiful dashboard. Kanban boards, timeline views, and analytics to manage your entire job search pipeline.',
      benefits: [
        'Visual pipeline management',
        'Interview scheduling',
        'Notes & reminders',
        'Performance analytics',
      ],
      stats: { value: '100%', label: 'Organization' },
      status: 'Live',
      statusColor: 'bg-green-500',
      image: '📊',
    },
    {
      id: 'security',
      icon: <Shield className="w-12 h-12 text-indigo-600" />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption keeps your personal information and applications secure. SOC 2 compliant with regular security audits and penetration testing.',
      benefits: [
        'End-to-end encryption',
        'SOC 2 Type II certified',
        'GDPR & CCPA compliant',
        'Regular security audits',
      ],
      stats: { value: '100%', label: 'Data protection' },
      status: 'Live',
      statusColor: 'bg-green-500',
      image: '🔒',
    },
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Particles Background */}
      <ParticlesBackground />

      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-pulse-glow">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Everything you need to succeed</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              Powerful Features for
              <br />
              <span className="text-gradient-animate">Your Dream Career</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Sivio combines cutting-edge AI with proven job search strategies to help you land internships 10x faster than traditional methods.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="lg" href="/sign-up" className="bg-white text-blue-600 hover:scale-110">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="lg" href="/jobs" className="border-2 border-white text-white hover:bg-white/10">
                Browse Jobs
                <ExternalLink className="w-5 h-5" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                Your Complete Internship <span className="text-blue-600">Command Center</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to land internships at top companies, all in one platform
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.id} delay={index * 100}>
                <TiltCard className="h-full relative overflow-hidden">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`${feature.statusColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {feature.status}
                    </span>
                  </div>

                  {/* Feature Icon */}
                  <div className="mb-6">
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits List */}
                  <div className="space-y-3 mb-6">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={24} className="text-blue-600" />
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

                  {/* Mockup Placeholder */}
                  <div className="mt-6 bg-gray-100 rounded-xl p-12 text-center text-6xl">
                    {feature.image}
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                How It All <span className="text-gradient-animate">Works Together</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A seamless workflow designed for maximum efficiency
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-8 max-w-4xl mx-auto">
            {[
              {
                step: 1,
                title: 'AI Discovers Opportunities',
                description: 'Our AI scans 50,000+ internship listings daily and matches you with the best fit positions based on your skills, interests, and career goals.',
                icon: <Brain size={24} />,
              },
              {
                step: 2,
                title: 'Auto-Apply Does the Work',
                description: 'With one click, apply to hundreds of positions with custom-tailored cover letters and optimized resumes for each role.',
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
                description: 'Personalized email sequences automatically follow up with contacts, keeping you top of mind without lifting a finger.',
                icon: <Mail size={24} />,
              },
              {
                step: 5,
                title: 'Smart CRM Tracks Everything',
                description: 'See exactly where each application stands, schedule interviews, and manage your entire job search from one beautiful dashboard.',
                icon: <BarChart3 size={24} />,
              },
            ].map((item, index) => (
              <ScrollReveal key={item.step} delay={index * 100}>
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-blue-600">{item.icon}</div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-5xl font-black text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600 font-semibold">Students Placed</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-5xl font-black text-purple-600 mb-2">85%</div>
                <div className="text-gray-600 font-semibold">Interview Rate</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-5xl font-black text-pink-600 mb-2">$75K</div>
                <div className="text-gray-600 font-semibold">Average Offer</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl">
              <Sparkles className="w-16 h-16 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl font-black mb-4">
                Ready to 10x Your Job Search?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join 10,000+ students landing internships faster with Sivio
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" href="/sign-up" className="bg-white text-blue-600 hover:scale-110">
                  Start Free Trial →
                </Button>
                <Button variant="ghost" size="lg" href="/pricing" className="border-2 border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-6">No credit card required • 7-day free trial</p>
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
