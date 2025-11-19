/**
 * About Page - World-Class UI
 * Compelling founder story, mission, values, and team
 * Enhanced with Card, ScrollReveal, Button, and animations
 */

'use client'

import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'
import {
  Target,
  Heart,
  Zap,
  Users,
  Sparkles,
  TrendingUp,
  Shield,
  Rocket,
  ArrowRight,
  Linkedin,
  Twitter,
  Mail,
} from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: <Target className="w-12 h-12 text-blue-600" />,
      title: 'Student-First',
      description: 'Every feature we build starts with asking: "Will this help students land their dream internship?" We obsess over student success metrics, not vanity numbers.',
      impact: '10,000+ students placed',
    },
    {
      icon: <Heart className="w-12 h-12 text-purple-600" />,
      title: 'Empathy-Driven',
      description: 'We understand the stress, anxiety, and frustration of job searching. Our platform is designed to reduce stress and boost confidence at every step.',
      impact: '85% reduced job search anxiety',
    },
    {
      icon: <Zap className="w-12 h-12 text-green-600" />,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI and automation to give students an unfair advantage. If technology exists, we use it to level the playing field.',
      impact: '10x faster applications',
    },
    {
      icon: <Users className="w-12 h-12 text-orange-600" />,
      title: 'Community',
      description: 'Success is better together. We\'re building a community of ambitious students helping each other succeed through shared knowledge and support.',
      impact: '50K+ community members',
    },
  ]

  const stats = [
    { value: '10,000+', label: 'Students Placed', icon: <Users className="w-8 h-8 text-blue-600" /> },
    { value: '500,000+', label: 'Applications Sent', icon: <Rocket className="w-8 h-8 text-purple-600" /> },
    { value: '85%', label: 'Interview Rate', icon: <TrendingUp className="w-8 h-8 text-green-600" /> },
    { value: '$75K', label: 'Avg Starting Salary', icon: <Sparkles className="w-8 h-8 text-orange-600" /> },
  ]

  const team = [
    {
      name: 'Ethan Bailine',
      role: 'Founder & CEO',
      bio: 'Former Google intern turned job search revolutionary. Built Sivio after watching too many talented friends struggle with broken recruiting systems.',
      image: '👨‍💼',
      linkedin: '#',
      twitter: '#',
      email: 'ethan@sivio.com',
    },
    {
      name: 'Engineering Team',
      role: 'Product & Engineering',
      bio: 'World-class engineers from Stanford, MIT, and top tech companies building the future of job search automation.',
      image: '💻',
      linkedin: '#',
      twitter: '#',
      email: 'team@sivio.com',
    },
    {
      name: 'Student Advisors',
      role: 'Community & Success',
      bio: 'Students who landed internships at FAANG companies now helping the next generation succeed.',
      image: '🎓',
      linkedin: '#',
      twitter: '#',
      email: 'community@sivio.com',
    },
  ]

  const milestones = [
    {
      year: '2024',
      title: 'Sivio Founded',
      description: 'Started with a simple vision: make internship hunting suck less.',
    },
    {
      year: '2024 Q3',
      title: '1,000 Students',
      description: 'Reached our first 1,000 active users. 78% interview rate proved the concept worked.',
    },
    {
      year: '2024 Q4',
      title: 'AI-Powered Matching',
      description: 'Launched AI job matching engine. Students found relevant jobs 10x faster.',
    },
    {
      year: '2025 Q1',
      title: '10,000 Students',
      description: 'Hit 10K active students with 85% interview rate and $75K average offer.',
    },
    {
      year: '2025 Q2',
      title: 'The Future',
      description: 'Launching auto-apply, contact finder, and AI outreach. The revolution begins.',
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
              <span className="font-semibold">Our Mission</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              We're Democratizing
              <br />
              <span className="text-gradient-animate">Career Success</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl sm:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed">
              41% of college graduates end up underemployed. We're building a world where talent—not connections—determines success.
            </p>
            <p className="text-lg text-blue-200 mb-12 max-w-3xl mx-auto">
              By 2030, we aim to help 1 million students land internships that launch extraordinary careers.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="lg" href="/sign-up" className="bg-white text-blue-600 hover:scale-110">
                Join Our Mission
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="lg" href="/contact" className="border-2 border-white text-white hover:bg-white/10">
                Get in Touch
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-16">
              The <span className="text-blue-600">Sivio</span> Story
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <Card className="bg-white rounded-3xl p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  <strong className="text-gray-900">The Problem:</strong> 41% of college graduates are underemployed in their first job (Federal Reserve Bank of NY, 2023). That's not a skills problem—it's a broken system.
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Students waste <strong>100+ hours per month</strong> applying to hundreds of jobs with only a <strong>2% response rate</strong>. The average job search takes <strong>6 months</strong>. Meanwhile, 85% of jobs are filled through networking—giving connected students an enormous advantage.
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  <strong className="text-gray-900">The Cost:</strong> Starting your career underemployed costs <strong>$1.2 million in lifetime earnings</strong> (Federal Reserve Bank of St. Louis, 2022). The first job matters—a lot.
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  <strong className="text-gray-900">Our Solution:</strong> Sivio gives every student the same tools as those with insider connections. AI job matching cuts through 50,000+ listings. Auto-apply submits hundreds of applications monthly. Contact finder reaches hiring managers directly. Smart outreach gets 3x higher response rates.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <em className="text-blue-600 font-semibold">Result: Students cut their job search from 6 months to weeks, avoid underemployment, and start careers that compound into millions in lifetime earnings.</em>
                </p>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-16">
              Our <span className="text-gradient-animate">Core Values</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="h-full">
                  <div className="mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {value.description}
                  </p>
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <TrendingUp size={20} />
                      <span>{value.impact}</span>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-16">
              Our <span className="text-blue-600">Journey</span>
            </h2>
          </ScrollReveal>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {milestone.year}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-6">
              Meet the <span className="text-gradient-animate">Team</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
              We're a team of students, engineers, and career experts on a mission to fix recruiting
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="text-center">
                  <div className="text-6xl mb-6">{member.image}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <div className="text-blue-600 font-semibold mb-4">
                    {member.role}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {member.bio}
                  </p>
                  <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
                    <a href={member.linkedin} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Linkedin size={20} className="text-gray-600 hover:text-blue-600" />
                    </a>
                    <a href={member.twitter} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Twitter size={20} className="text-gray-600 hover:text-blue-400" />
                    </a>
                    <a href={`mailto:${member.email}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Mail size={20} className="text-gray-600 hover:text-purple-600" />
                    </a>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl">
              <Sparkles className="w-16 h-16 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl font-black mb-4">
                Join Our Mission
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Help us create a world where every talented student can land their dream internship
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" href="/sign-up" className="bg-white text-blue-600 hover:scale-110">
                  Get Started Free →
                </Button>
                <Button variant="ghost" size="lg" href="/jobs" className="border-2 border-white text-white hover:bg-white/10">
                  Browse Jobs
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
