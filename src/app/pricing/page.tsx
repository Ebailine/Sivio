/**
 * Pricing Page - World-Class UI
 * Transparent pricing tiers with annual toggle, comparison table, and trust signals
 * Enhanced with Card, ScrollReveal, Button, and comprehensive FAQ
 */

'use client'

import { useState } from 'react'
import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Shield,
  CreditCard,
  Users,
  Star,
  ArrowRight,
} from 'lucide-react'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Try Sivio with limited access',
      icon: <Sparkles className="w-8 h-8 text-gray-600" />,
      features: [
        '5 automated applications/month',
        '10 outreach contacts/month',
        'Basic job search',
        'Application tracking',
        'CRM access',
        'Email support',
      ],
      notIncluded: [
        'Unlimited applications',
        'AI job matching',
        'Contact finder',
        'Priority support',
      ],
      cta: 'Start Free',
      href: '/sign-up',
      popular: false,
      gradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
    },
    {
      name: 'Basic',
      monthlyPrice: 29,
      annualPrice: 23, // $23/mo when billed annually - 20% off
      description: 'Essential tools for job seekers',
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      features: [
        '50 automated applications/month',
        '50 outreach contacts/month',
        'AI-powered job matching',
        'Advanced CRM & analytics',
        'Application tracking',
        'Email support',
      ],
      notIncluded: [
        'Unlimited applications',
        'Unlimited contacts',
        'Priority support',
        'Interview prep resources',
      ],
      cta: 'Start Free Trial',
      href: '/sign-up',
      popular: false,
      gradient: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-400',
    },
    {
      name: 'Premium',
      monthlyPrice: 49,
      annualPrice: 39, // $39/mo when billed annually ($468/year) - 20% off
      description: 'Best value for serious students',
      icon: <Crown className="w-8 h-8 text-purple-600" />,
      features: [
        'Unlimited automated applications',
        '200 outreach contacts/month',
        'AI-powered job matching',
        'Auto-apply (coming soon)',
        'Email outreach automation',
        'Advanced CRM & analytics',
        'Interview prep resources',
        'Priority email support',
      ],
      notIncluded: [
        'Team collaboration',
        'Custom integrations',
      ],
      cta: 'Start Free Trial',
      href: '/sign-up',
      popular: true,
      gradient: 'from-purple-600 to-pink-600',
      borderColor: 'border-purple-500',
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,
      description: 'For universities & career centers',
      icon: <Shield className="w-8 h-8 text-green-600" />,
      features: [
        'Everything in Premium',
        'Unlimited contacts/month',
        'Team accounts (5+ seats)',
        'Custom integrations',
        'API access',
        'White-label options',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom training',
        'SLA guarantee',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      href: '/contact',
      popular: false,
      gradient: 'from-green-600 to-emerald-600',
      borderColor: 'border-green-500',
    },
  ]

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! You can cancel your subscription at any time. No questions asked, no cancellation fees. If you cancel mid-cycle, you\'ll have access until the end of your billing period.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) via Stripe. We also accept PayPal for annual plans.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! The Pro plan includes a 7-day free trial. No credit card required to start. You can explore all features risk-free before committing.',
    },
    {
      question: 'What happens when I reach my monthly limit?',
      answer: 'You can upgrade to a higher tier anytime, or wait until the next billing cycle. We\'ll send you notifications before you hit your limits so you never miss an opportunity.',
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes! We offer a 20% discount for students with a valid .edu email address. This applies to all paid plans, including annual subscriptions.',
    },
    {
      question: 'Can I switch plans later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your current billing cycle.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes! We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied for any reason, contact us within 14 days for a full refund.',
    },
    {
      question: 'What\'s included in the free plan?',
      answer: 'The free plan includes 10 applications per month, basic job search, application tracking, and email support. It\'s perfect for testing Sivio before upgrading.',
    },
    {
      question: 'How does the annual discount work?',
      answer: 'Annual plans save you 20% compared to monthly billing. For example, Pro costs $39/month or $372/year ($31/month), saving you $96 annually.',
    },
    {
      question: 'Can I get a custom plan?',
      answer: 'Yes! For universities, career centers, or large teams, we offer custom Enterprise plans. Contact our sales team to discuss your specific needs.',
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
              <span className="font-semibold">Simple, transparent pricing</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              <span className="text-yellow-300">Free During Beta.</span>
              <br />
              <span className="text-4xl sm:text-5xl">Invest Later, Earn Millions More.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl sm:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed">
              Try Sivio free while we're in beta. When you're ready to upgrade, avoid underemployment and earn $1.2M more over your lifetime.
            </p>
            <p className="text-sm text-blue-200 mb-12 max-w-2xl mx-auto">
              Source: Federal Reserve Bank of St. Louis (2022) - Lifetime earnings difference between strong career starts vs. underemployment
            </p>
          </ScrollReveal>

          {/* Annual Toggle */}
          <ScrollReveal delay={300}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`font-semibold ${!isAnnual ? 'text-white' : 'text-blue-200'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-16 h-8 rounded-full transition-colors duration-200 ${isAnnual ? 'bg-white' : 'bg-white/30'}`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-blue-600 rounded-full transition-transform duration-200 ${isAnnual ? 'translate-x-8' : ''}`} />
              </button>
              <span className={`font-semibold ${isAnnual ? 'text-white' : 'text-blue-200'}`}>
                Annual
                <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">Save 20%</span>
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <ScrollReveal key={plan.name} delay={index * 100}>
                <Card className={`h-full relative ${plan.popular ? 'ring-4 ring-blue-500 shadow-2xl' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg z-10">
                      ⭐ MOST POPULAR
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="mb-6">
                    {plan.icon}
                    <h3 className="text-3xl font-black text-gray-900 mt-4">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.monthlyPrice !== null ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black text-gray-900">
                            ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-gray-600">/month</span>
                        </div>
                        {isAnnual && plan.annualPrice > 0 && (
                          <div className="text-sm text-green-600 font-semibold mt-2">
                            Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/year
                          </div>
                        )}
                        {isAnnual && plan.annualPrice > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Billed ${plan.annualPrice * 12} annually
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-4xl font-black text-gray-900">
                        Custom Pricing
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    variant={plan.popular ? "gradient" : "primary"}
                    size="lg"
                    href={plan.href}
                    className="w-full mb-8"
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5" />
                  </Button>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">
                      What's Included:
                    </div>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.length > 0 && (
                      <>
                        <div className="border-t border-gray-200 pt-4 mt-4"></div>
                        {plan.notIncluded.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <X size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-400 line-through">{feature}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* Beta Notice Banner */}
          <ScrollReveal delay={300}>
            <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center shadow-xl">
              <h3 className="text-2xl font-bold mb-2">🚀 Limited Beta Access</h3>
              <p className="text-blue-100 mb-4 text-lg">
                All plans are currently free during beta. Pricing will be activated after public launch.
              </p>
              <Button variant="ghost" size="lg" href="/sign-up" className="bg-white text-blue-600 hover:bg-blue-50">
                Request Access →
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Shield className="w-12 h-12 text-blue-600 mb-3" />
                <div className="font-bold text-gray-900">14-Day Money-Back</div>
                <div className="text-sm text-gray-600">100% satisfaction guaranteed</div>
              </div>
              <div className="flex flex-col items-center">
                <CreditCard className="w-12 h-12 text-purple-600 mb-3" />
                <div className="font-bold text-gray-900">Secure Payments</div>
                <div className="text-sm text-gray-600">Powered by Stripe</div>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-12 h-12 text-pink-600 mb-3" />
                <div className="font-bold text-gray-900">300+ Beta Users</div>
                <div className="text-sm text-gray-600">Testing Sivio</div>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-12 h-12 text-yellow-500 mb-3" />
                <div className="font-bold text-gray-900">In Beta</div>
                <div className="text-sm text-gray-600">Limited access</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-16">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl">
              <h2 className="text-4xl font-black mb-4">
                Join the Beta Waitlist
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Get early access to Sivio before public launch
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" href="/sign-up" className="bg-white text-blue-600 hover:scale-110">
                  Request Beta Access →
                </Button>
                <Button variant="ghost" size="lg" href="/contact" className="border-2 border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-6">Free during beta • Limited access available</p>
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
