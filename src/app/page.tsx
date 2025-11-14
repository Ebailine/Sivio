/**
 * Sivio Homepage - The Ultimate Internship Application Platform
 * Most persuasive landing page designed to convert students
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import {
  Sparkles,
  Zap,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Award,
  Rocket,
  Brain,
  Mail,
  Linkedin,
  FileText,
  BarChart3,
  Clock,
  DollarSign,
  Shield,
  Globe,
  ChevronRight,
  PlayCircle,
} from 'lucide-react'

export default function Home() {
  const { isSignedIn, user } = useUser()
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'elite'>('pro')

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-pulse">
              <Sparkles size={20} />
              <span className="font-semibold">Trusted by 10,000+ students at top universities</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              Land Your Dream Internship
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stop wasting 5+ hours daily on job applications. Sivio's AI-powered platform automates everything
              from finding perfect-fit roles to connecting with hiring managers, so you can focus on acing interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
                >
                  Go to Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="group flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
                  >
                    Start Free Trial
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/jobs"
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-200"
                  >
                    <PlayCircle size={20} />
                    Browse Jobs
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { number: '10,000+', label: 'Students Placed' },
                { number: '85%', label: 'Interview Rate' },
                { number: '5hrs', label: 'Saved Weekly' },
                { number: '$75K', label: 'Avg Offer' },
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-4xl font-black mb-2">{stat.number}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-600 mb-8 font-semibold">TRUSTED BY STUDENTS FROM</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {['MIT', 'Stanford', 'Harvard', 'Berkeley', 'CMU', 'Yale'].map((school) => (
              <div key={school} className="text-3xl font-black text-gray-900">{school}</div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              The Old Way is <span className="text-red-600">Broken</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Students waste hundreds of hours on manual applications with terrible results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock size={40} className="text-red-500" />,
                problem: '5+ Hours Daily',
                description: 'Manually filling out repetitive application forms, tailoring resumes, writing cover letters'
              },
              {
                icon: <TrendingUp size={40} className="text-red-500" />,
                problem: '2% Response Rate',
                description: 'Applying blindly without insider connections or personalized outreach to decision makers'
              },
              {
                icon: <Brain size={40} className="text-red-500" />,
                problem: 'Zero Strategy',
                description: 'No system to track applications, follow up with contacts, or optimize your approach'
              },
            ].map((item, index) => (
              <div key={index} className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.problem}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full mb-6">
              <Zap size={20} />
              <span className="font-semibold">The Sivio Advantage</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Your Complete Internship <span className="text-blue-600">Command Center</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to land internships at top companies - automated, intelligent, and ridiculously effective
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Target size={32} className="text-blue-600" />,
                title: 'AI Job Matching',
                description: 'Our AI analyzes your profile and finds perfect-fit internships from 50,000+ live listings. No more endless scrolling.',
                benefit: 'Save 10+ hrs/week'
              },
              {
                icon: <Zap size={32} className="text-purple-600" />,
                title: 'One-Click Auto-Apply',
                description: 'Apply to 100+ jobs in minutes with AI-customized applications for each role. Yes, it\'s that easy.',
                benefit: '100x faster applications'
              },
              {
                icon: <Users size={32} className="text-green-600" />,
                title: 'Smart Contact Finder',
                description: 'Instantly find and connect with hiring managers, recruiters, and employees at your target companies.',
                benefit: '85% interview rate'
              },
              {
                icon: <Mail size={32} className="text-orange-600" />,
                title: 'Automated Outreach',
                description: 'AI-powered email sequences that get responses. Personalized for each contact, automated for scale.',
                benefit: '40% response rate'
              },
              {
                icon: <BarChart3 size={32} className="text-pink-600" />,
                title: 'CRM & Analytics',
                description: 'Track every application, contact, and follow-up in one beautiful dashboard. Know exactly where you stand.',
                benefit: 'Stay organized'
              },
              {
                icon: <Brain size={32} className="text-indigo-600" />,
                title: 'Interview Prep AI',
                description: 'Practice with our AI interviewer trained on 10,000+ real interviews. Get instant feedback and improve fast.',
                benefit: 'Ace every interview'
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-gray-200/50">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <CheckCircle2 size={16} />
                  {feature.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              From Job Search to <span className="text-blue-600">Offer Letter</span> in 3 Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              It's so simple, you'll wonder why you ever did it the hard way
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Set Your Preferences',
                description: 'Tell us your dream role, target companies, location, and salary expectations. Takes 2 minutes.',
                icon: <Target size={48} className="text-blue-600" />
              },
              {
                step: '2',
                title: 'Let AI Work Its Magic',
                description: 'Our platform finds perfect matches, auto-applies, and reaches out to hiring managers while you sleep.',
                icon: <Zap size={48} className="text-purple-600" />
              },
              {
                step: '3',
                title: 'Show Up & Ace Interviews',
                description: 'Focus on what matters - preparing for and crushing interviews. We handle everything else.',
                icon: <Award size={48} className="text-green-600" />
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black shadow-lg">
                    {step.step}
                  </div>
                  <div className="mb-6 mt-4">{step.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-700 text-lg">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 z-10">
                    <ChevronRight size={32} className="text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Students Are Landing <span className="text-yellow-300">Dream Offers</span>
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of successful students who transformed their job search
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                school: 'Stanford CS',
                company: 'Google',
                quote: 'Landed my Google SWE internship in 2 weeks. Sivio found the perfect contacts and my auto-generated emails got 60% response rate. Insane.',
                image: '👩‍💻'
              },
              {
                name: 'Marcus Williams',
                school: 'MIT Sloan',
                company: 'Goldman Sachs',
                quote: 'Applied to 200+ finance internships in 3 days. Got 12 interviews and 3 offers. This platform is a cheat code for recruiting.',
                image: '👨‍💼'
              },
              {
                name: 'Priya Patel',
                school: 'Berkeley EECS',
                company: 'Meta',
                quote: 'The AI contact finder is pure magic. Connected with a Meta engineering manager who referred me. Start date: next summer!',
                image: '👩‍🔬'
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={20} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-white mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-blue-200 text-sm">{testimonial.school}</div>
                    <div className="text-yellow-300 text-sm font-semibold">→ {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-6xl font-black mb-6">
            Your Dream Internship is Waiting
          </h2>
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed">
            Stop competing with thousands of applicants. Start getting interviews at top companies.
          </p>
          <p className="text-2xl font-bold mb-8">
            Join 10,000+ students who are landing internships 10x faster
          </p>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <Rocket size={24} />
              Launch Your Success
              <ArrowRight size={24} />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Rocket size={24} />
                Start Free Trial Now
                <ArrowRight size={24} />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 px-10 py-5 rounded-xl font-bold text-xl hover:bg-white/20 transition-all duration-200"
              >
                Browse 50,000+ Jobs
                <ChevronRight size={24} />
              </Link>
            </div>
          )}
          <p className="mt-8 text-blue-100">
            <CheckCircle2 size={20} className="inline mr-2" />
            No credit card required • Cancel anytime • 14-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-3xl font-black text-white mb-4">Sivio</div>
          <p className="mb-6">The smartest way for students to land internships</p>
          <div className="flex justify-center gap-8 mb-8">
            <Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">Get Started</Link>
          </div>
          <p className="text-sm">© 2025 Sivio. All rights reserved. Built for students, by students who landed at FAANG.</p>
        </div>
      </footer>
    </div>
  )
}
