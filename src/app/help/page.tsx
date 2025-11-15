/**
 * Help Center Page - World-Class UI
 * Comprehensive support with 20+ help articles organized by category
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
  Search,
  BookOpen,
  MessageSquare,
  FileText,
  Settings,
  CreditCard,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  const categories = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      title: 'Getting Started',
      description: 'New to Sivio? Start here',
      color: 'bg-blue-50',
      articleCount: 5,
    },
    {
      icon: <Settings className="w-8 h-8 text-purple-600" />,
      title: 'Account & Settings',
      description: 'Manage your account',
      color: 'bg-purple-50',
      articleCount: 5,
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: 'Features & Tools',
      description: 'Deep dive into features',
      color: 'bg-green-50',
      articleCount: 7,
    },
    {
      icon: <CreditCard className="w-8 h-8 text-orange-600" />,
      title: 'Billing & Plans',
      description: 'Payments and subscriptions',
      color: 'bg-orange-50',
      articleCount: 4,
    },
  ]

  const articles = [
    {
      id: 'getting-started-1',
      category: 'Getting Started',
      question: 'How do I create my first Sivio account?',
      answer: 'Click "Sign Up" in the top right corner, enter your email and create a password. You\'ll receive a verification email. Click the link to verify your account and you\'re ready to start! No credit card required for the free plan.',
    },
    {
      id: 'getting-started-2',
      category: 'Getting Started',
      question: 'What should I do first after signing up?',
      answer: 'After signing up: 1) Complete your profile with your resume, skills, and preferences. 2) Browse jobs to see what\'s available. 3) Set up your job alerts. 4) Explore the CRM to track applications. 5) Check out our video tutorials in the Help Center.',
    },
    {
      id: 'getting-started-3',
      category: 'Getting Started',
      question: 'How does Sivio help me find internships?',
      answer: 'Sivio aggregates 50,000+ internship listings from across the web. Our AI matches you with relevant positions based on your skills, major, and preferences. You\'ll get daily email alerts for new matches, and can apply directly through our platform.',
    },
    {
      id: 'getting-started-4',
      category: 'Getting Started',
      question: 'Do I need to upload my resume?',
      answer: 'Yes! Your resume is essential for job matching and auto-apply features. Upload it in Settings > Profile. We support PDF, DOCX, and TXT formats. Our AI will parse it to understand your skills and experience.',
    },
    {
      id: 'getting-started-5',
      category: 'Getting Started',
      question: 'How long does it take to see results?',
      answer: 'Most students see their first interview requests within 2 weeks of consistent use. With Pro features like auto-apply and contact finder, students average 5-10 interviews in the first month. Results vary based on your qualifications and target roles.',
    },

    {
      id: 'account-1',
      category: 'Account & Settings',
      question: 'How do I update my profile information?',
      answer: 'Go to Settings > Profile. Here you can update your name, email, phone, resume, skills, and job preferences. Changes save automatically. Keep your profile updated to get better job matches.',
    },
    {
      id: 'account-2',
      category: 'Account & Settings',
      question: 'How do I change my password?',
      answer: 'Navigate to Settings > Security > Change Password. Enter your current password, then your new password twice. Click "Update Password". You\'ll receive an email confirming the change.',
    },
    {
      id: 'account-3',
      category: 'Account & Settings',
      question: 'Can I delete my account?',
      answer: 'Yes. Go to Settings > Account > Delete Account. This is permanent and will delete all your data, applications, and contacts. We\'ll send a confirmation email. You have 30 days to cancel the deletion.',
    },
    {
      id: 'account-4',
      category: 'Account & Settings',
      question: 'How do I set my job preferences?',
      answer: 'Settings > Job Preferences lets you set: desired roles, locations, salary range, company size, industries, and remote vs in-person preference. Our AI uses these to match you with relevant jobs.',
    },
    {
      id: 'account-5',
      category: 'Account & Settings',
      question: 'How do I manage email notifications?',
      answer: 'Go to Settings > Notifications. Toggle on/off: job alerts, application updates, outreach responses, weekly summaries, and product updates. Save your preferences.',
    },

    {
      id: 'features-1',
      category: 'Features & Tools',
      question: 'How does the job search work?',
      answer: 'Our job search aggregates listings from 100+ sources. Use filters for location, role, salary, and company. Save searches to get alerts. Our AI scores each job based on your profile fit (0-100%). Click "Apply" to submit your application.',
    },
    {
      id: 'features-2',
      category: 'Features & Tools',
      question: 'What is the Application CRM?',
      answer: 'The CRM tracks every application in a visual pipeline: Applied > Interviewing > Offer > Accepted/Rejected. Add notes, set reminders, and track contacts for each application. See your entire job search at a glance.',
    },
    {
      id: 'features-3',
      category: 'Features & Tools',
      question: 'How does Contact Finder work? (Pro)',
      answer: 'Contact Finder searches LinkedIn and company databases to find verified email addresses of recruiters and hiring managers. Enter a company name and role, and we\'ll return contacts with 85%+ accuracy. 50 searches/month on Pro.',
    },
    {
      id: 'features-4',
      category: 'Features & Tools',
      question: 'How do I use Auto-Apply? (Coming Soon)',
      answer: 'Auto-Apply will submit applications on your behalf. Set criteria (roles, locations, companies), and we\'ll apply to matching jobs with custom cover letters. You approve each application before submission. Launching Q2 2025.',
    },
    {
      id: 'features-5',
      category: 'Features & Tools',
      question: 'What is AI Outreach? (Pro)',
      answer: 'AI Outreach generates personalized emails to recruiters and hiring managers. Input a contact and job, and our AI writes a custom message based on your background and the role. 60% average response rate.',
    },
    {
      id: 'features-6',
      category: 'Features & Tools',
      question: 'How do I save jobs for later?',
      answer: 'Click the bookmark icon on any job listing to save it. View saved jobs in Dashboard > Saved Jobs. Add notes and set reminders. Saved jobs don\'t expire—apply when you\'re ready.',
    },
    {
      id: 'features-7',
      category: 'Features & Tools',
      question: 'Can I track interview dates in the CRM?',
      answer: 'Yes! When an application moves to "Interviewing" stage, click "Add Interview" to set date, time, format (phone/video/in-person), and notes. You\'ll get email reminders 24 hours before.',
    },

    {
      id: 'billing-1',
      category: 'Billing & Plans',
      question: 'What\'s included in the Free plan?',
      answer: 'Free plan includes: 10 applications/month, job search, application tracking, CRM access, and email support. Perfect for testing Sivio before upgrading.',
    },
    {
      id: 'billing-2',
      category: 'Billing & Plans',
      question: 'How much does Pro cost?',
      answer: 'Pro costs $29/month or $288/year ($24/month, save 20%). Includes: unlimited applications, 50 contact searches/month, AI outreach, auto-apply (coming soon), and priority support. Students get an additional 20% off with .edu email.',
    },
    {
      id: 'billing-3',
      category: 'Billing & Plans',
      question: 'How do I upgrade or downgrade my plan?',
      answer: 'Go to Settings > Billing > Change Plan. Select your new plan and confirm. Upgrades take effect immediately. Downgrades take effect at the end of your billing cycle. You won\'t lose any data.',
    },
    {
      id: 'billing-4',
      category: 'Billing & Plans',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover) via Stripe. Annual plans also accept PayPal. All payments are secure and encrypted.',
    },
  ]

  const popularArticles = articles.slice(0, 6)

  const toggleArticle = (id: string) => {
    setExpandedArticle(expandedArticle === id ? null : id)
  }

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
              <HelpCircle className="w-5 h-5" />
              <span className="font-semibold">We're here to help</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              How can we <span className="text-gradient-animate">help you?</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Search our knowledge base or browse by category
            </p>
          </ScrollReveal>

          {/* Search Bar */}
          <ScrollReveal delay={300}>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Trust Signals */}
          <ScrollReveal delay={400}>
            <div className="flex items-center justify-center gap-8 mt-8 text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">{articles.length}+ articles</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">24hr response time</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">
              Browse by <span className="text-blue-600">Category</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <TiltCard className="h-full hover:shadow-2xl transition-shadow cursor-pointer">
                  <div className={`${category.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <div className="text-blue-600 font-semibold text-sm">
                    {category.articleCount} articles →
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-black text-gray-900 mb-12">
              📌 Popular Articles
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <ScrollReveal key={article.id} delay={index * 50}>
                <TiltCard className="bg-white">
                  <button
                    onClick={() => toggleArticle(article.id)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-blue-600 mb-2">
                        {article.category}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {article.question}
                      </h3>
                    </div>
                    {expandedArticle === article.id ? (
                      <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0 ml-4" />
                    )}
                  </button>
                  {expandedArticle === article.id && (
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-gray-600 leading-relaxed">
                        {article.answer}
                      </p>
                    </div>
                  )}
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* All Articles by Category */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-black text-gray-900 mb-12">
              All Help Articles
            </h2>
          </ScrollReveal>

          {['Getting Started', 'Account & Settings', 'Features & Tools', 'Billing & Plans'].map((category, catIndex) => (
            <ScrollReveal key={category} delay={catIndex * 100}>
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {category}
                </h3>
                <div className="space-y-3">
                  {articles
                    .filter((article) => article.category === category)
                    .map((article, index) => (
                      <TiltCard key={article.id} className="bg-white hover:shadow-lg transition-shadow">
                        <button
                          onClick={() => toggleArticle(article.id)}
                          className="w-full flex items-center justify-between p-5 text-left"
                        >
                          <span className="font-semibold text-gray-900">
                            {article.question}
                          </span>
                          {expandedArticle === article.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                          )}
                        </button>
                        {expandedArticle === article.id && (
                          <div className="px-5 pb-5 pt-0">
                            <p className="text-gray-600 leading-relaxed">
                              {article.answer}
                            </p>
                          </div>
                        )}
                      </TiltCard>
                    ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <TiltCard className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
              <Sparkles className="w-16 h-16 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl font-black mb-4">
                Still Need Help?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" href="/contact" className="bg-white text-blue-600 hover:scale-110">
                  Contact Support
                  <Mail className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="lg" href="#" className="border-2 border-white text-white hover:bg-white/10">
                  Live Chat
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-6">Average response time: 4 hours</p>
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
