/**
 * Pricing Page
 * Transparent pricing tiers for Sivio
 */

import Link from 'next/link'
import MainNav from '@/components/MainNav'
import InteractiveCard from '@/components/InteractiveCard'
import AnimatedButton from '@/components/AnimatedButton'
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: <Sparkles size={24} className="text-gray-600" />,
      features: [
        { text: '10 auto-applies per month', included: true },
        { text: '5 contact searches', included: true },
        { text: 'Basic job matching', included: true },
        { text: 'Application tracking', included: true },
        { text: 'Email support', included: true },
        { text: 'Outreach automation', included: false },
        { text: 'Advanced CRM features', included: false },
        { text: 'Priority support', included: false },
      ],
      cta: 'Start Free',
      popular: false,
      gradient: 'from-gray-100 to-gray-200',
      textColor: 'text-gray-900',
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For serious job seekers',
      icon: <Zap size={24} className="text-blue-600" />,
      features: [
        { text: '500 auto-applies per month', included: true },
        { text: '100 contact searches', included: true },
        { text: 'AI-powered job matching', included: true },
        { text: 'Full CRM access', included: true },
        { text: 'Outreach automation (50 emails/month)', included: true },
        { text: 'Interview prep resources', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Custom cover letters', included: true },
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-blue-600 to-purple-600',
      textColor: 'text-white',
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'For universities & career centers',
      icon: <Crown size={24} className="text-yellow-600" />,
      features: [
        { text: 'Unlimited auto-applies', included: true },
        { text: 'Unlimited contact searches', included: true },
        { text: 'Advanced AI matching', included: true },
        { text: 'Team collaboration tools', included: true },
        { text: 'Unlimited outreach automation', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'White-label options', included: true },
        { text: 'Analytics & reporting', included: true },
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-purple-600 to-pink-600',
      textColor: 'text-white',
    },
  ]

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! You can cancel your subscription at any time. No questions asked, no cancellation fees.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! Pro plan includes a 7-day free trial. No credit card required to start.',
    },
    {
      question: 'What happens when I reach my monthly limit?',
      answer: 'You can upgrade to a higher tier anytime, or wait until the next billing cycle. We\'ll notify you before you hit your limits.',
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes! We offer a 20% discount for students with a valid .edu email address.',
    },
    {
      question: 'Can I switch plans later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
            💎 Simple, transparent pricing
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <InteractiveCard
              key={plan.name}
              tilt={plan.popular}
              glow={plan.popular}
              maxTilt={plan.popular ? 5 : 0}
              className={plan.popular ? 'md:-mt-4 md:scale-105' : ''}
            >
              <div className="relative overflow-hidden">
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 text-sm font-bold rounded-bl-xl">
                    MOST POPULAR
                  </div>
                )}

                <div className={`p-8 ${plan.name === 'Pro' ? 'bg-gradient-to-br from-blue-600 to-purple-600' : ''} ${plan.name === 'Enterprise' ? 'bg-gradient-to-br from-purple-600 to-pink-600' : ''}`}>
                  <div className="mb-4">{plan.icon}</div>
                  <h3 className={`text-2xl font-bold mb-2 ${plan.name !== 'Free' ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mb-6 ${plan.name !== 'Free' ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <div className={`text-5xl font-black ${plan.name !== 'Free' ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </div>
                    <div className={`text-sm ${plan.name !== 'Free' ? 'text-blue-100' : 'text-gray-600'}`}>
                      {plan.period}
                    </div>
                  </div>

                  <AnimatedButton
                    href={plan.name === 'Enterprise' ? '/contact' : '/sign-up'}
                    variant={plan.name === 'Free' ? 'outline' : 'gradient'}
                    size="lg"
                    className={`w-full ${plan.name !== 'Free' ? 'bg-white text-blue-600' : ''}`}
                  >
                    {plan.cta}
                  </AnimatedButton>
                </div>

                <div className="p-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>

        {/* Student Discount Banner */}
        <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">🎓 Student Discount</h3>
          <p className="text-green-100 mb-4">
            Get 20% off any paid plan with a valid .edu email address
          </p>
          <AnimatedButton
            href="/sign-up"
            variant="gradient"
            className="bg-white text-green-600"
          >
            Claim Your Discount
          </AnimatedButton>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <h2 className="text-4xl font-black text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-black mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our team is here to help you find the perfect plan
          </p>
          <AnimatedButton
            href="/contact"
            variant="gradient"
            size="xl"
            className="bg-white text-blue-600"
          >
            Contact Sales
          </AnimatedButton>
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
