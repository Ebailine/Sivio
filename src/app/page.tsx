/**
 * Sivio Homepage - The Ultimate Internship Application Platform
 * Most persuasive landing page designed to convert students
 */

'use client'

import { useUser } from '@clerk/nextjs'
import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { TiltCard } from '@/components/ui/TiltCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { CountUpNumber } from '@/components/ui/CountUpNumber'
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'
import {
  Sparkles,
  Zap,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Rocket,
  Brain,
  Mail,
  BarChart3,
  Clock,
  DollarSign,
  Shield,
  PlayCircle,
} from 'lucide-react'

export default function Home() {
  const { isSignedIn } = useUser()

  const features = [
    {
      icon: <Target className="w-10 h-10 text-blue-600" />,
      title: 'AI Job Matching',
      description: 'Our AI analyzes your profile and finds perfect-fit internships from 50,000+ live listings.',
      benefit: 'Save 10+ hrs/week',
      color: 'blue'
    },
    {
      icon: <Zap className="w-10 h-10 text-purple-600" />,
      title: 'Auto-Apply',
      description: 'Automatically apply to hundreds of relevant positions with custom cover letters.',
      benefit: '500+ apps/month',
      color: 'purple'
    },
    {
      icon: <Mail className="w-10 h-10 text-green-600" />,
      title: 'Contact Finder',
      description: 'Find verified email addresses of recruiters and hiring managers at target companies.',
      benefit: '95% accuracy',
      color: 'green'
    },
    {
      icon: <Brain className="w-10 h-10 text-pink-600" />,
      title: 'Smart Outreach',
      description: 'AI-generated personalized emails that actually get responses from recruiters.',
      benefit: '3x response rate',
      color: 'pink'
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-orange-600" />,
      title: 'CRM Dashboard',
      description: 'Track every application, contact, and conversation in one beautiful dashboard.',
      benefit: 'Full visibility',
      color: 'orange'
    },
    {
      icon: <Shield className="w-10 h-10 text-indigo-600" />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption keeps your personal information and applications secure.',
      benefit: '100% secure',
      color: 'indigo'
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Stanford CS',
      company: 'Now @ Google',
      quote: 'Sivio helped me land my dream SWE internship in 2 weeks. The auto-apply feature is a game changer!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'MIT Engineering',
      company: 'Now @ Tesla',
      quote: 'I went from 20 applications/week to 200/week. Got 3x more interviews and multiple offers.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Berkeley Business',
      company: 'Now @ McKinsey',
      quote: 'The contact finder is incredible. I was reaching hiring managers directly instead of black hole applications.',
      rating: 5
    },
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating particles background */}
      <ParticlesBackground />

      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-pulse-glow">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Trusted by 10,000+ students at top universities</span>
            </div>

            {/* Main headline with animated gradient */}
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              Land Your Dream Internship
              <br />
              <span className="text-gradient-animate">10x Faster</span>
            </h1>

            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stop wasting 5+ hours daily on job applications. Sivio's AI-powered platform automates everything
              from finding perfect-fit roles to connecting with hiring managers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isSignedIn ? (
                <Button variant="gradient" size="lg" href="/dashboard" className="group">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button variant="gradient" size="lg" href="/sign-up" className="group">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="ghost" size="lg" href="/jobs">
                    <PlayCircle className="w-5 h-5" />
                    Browse Jobs
                  </Button>
                </>
              )}
            </div>

            {/* Stats Cards with Count Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <ScrollReveal delay={0} className="stagger-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="text-4xl font-black mb-2">
                    <CountUpNumber end={10000} suffix="+" />
                  </div>
                  <div className="text-blue-100 text-sm">Students Placed</div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100} className="stagger-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="text-4xl font-black mb-2">
                    <CountUpNumber end={85} suffix="%" />
                  </div>
                  <div className="text-blue-100 text-sm">Interview Rate</div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200} className="stagger-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="text-4xl font-black mb-2">
                    <CountUpNumber end={5} suffix="hrs" />
                  </div>
                  <div className="text-blue-100 text-sm">Saved Weekly</div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300} className="stagger-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="text-4xl font-black mb-2">
                    $<CountUpNumber end={75} suffix="K" />
                  </div>
                  <div className="text-blue-100 text-sm">Avg Offer</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="relative max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                Your Complete Internship <span className="text-blue-600">Command Center</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to land internships at top companies
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 100}>
                <TiltCard className="glow-on-hover h-full">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {feature.benefit}
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 bg-white">
        <div className="relative max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                How It <span className="text-gradient-animate">Works</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get from zero to offer in 4 simple steps
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                title: 'Create Your Profile',
                description: 'Upload your resume and tell us about your dream internship. Our AI analyzes your skills and preferences.',
                icon: <Users className="w-8 h-8" />
              },
              {
                step: 2,
                title: 'AI Finds Perfect Matches',
                description: 'We scan 50,000+ listings daily and match you with roles that fit your profile perfectly.',
                icon: <Brain className="w-8 h-8" />
              },
              {
                step: 3,
                title: 'Auto-Apply + Outreach',
                description: 'Automatically apply to hundreds of positions and reach out to hiring managers directly.',
                icon: <Rocket className="w-8 h-8" />
              },
              {
                step: 4,
                title: 'Land Your Dream Job',
                description: 'Track interviews, manage offers, and celebrate your success!',
                icon: <Star className="w-8 h-8" />
              },
            ].map((item, index) => (
              <ScrollReveal key={item.step} delay={index * 100}>
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-blue-600">{item.icon}</div>
                      <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-lg">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="relative max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                Loved by <span className="text-yellow-300">10,000+ Students</span>
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Join thousands of students landing their dream internships
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={testimonial.name} delay={index * 100}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                  <p className="text-blue-100 mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-blue-200">{testimonial.role}</div>
                    <div className="text-sm text-green-300 font-semibold mt-1">{testimonial.company}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-white">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white">
              <Rocket className="w-16 h-16 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl font-black mb-4">
                Ready to 10x Your Job Search?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join 10,000+ students landing internships faster with Sivio
              </p>
              <Button variant="gradient" size="lg" href="/sign-up" className="bg-white text-blue-600 hover:scale-110">
                Start Free Trial →
              </Button>
              <p className="text-sm text-blue-200 mt-4">No credit card required • 7-day free trial</p>
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
