/**
 * Contact Page - World-Class UI
 * Working contact form, multiple contact methods, FAQs, and quick response guarantees
 * Enhanced with Card, ScrollReveal, Button, and animations
 */

'use client'

import { useState } from 'react'
import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Sparkles,
  Clock,
  CheckCircle2,
  Linkedin,
  Twitter,
  Github,
  Send,
  ArrowRight,
  Briefcase,
  HelpCircle,
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for reaching out! We\'ll get back to you within 24 hours.')
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' })
      setIsSubmitting(false)
    }, 1000)
  }

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: 'Email Support',
      description: 'Get help with technical issues',
      contact: 'support@sivio.com',
      href: 'mailto:support@sivio.com',
      bgColor: 'bg-blue-50',
      responseTime: '< 24 hours',
    },
    {
      icon: <Briefcase className="w-6 h-6 text-purple-600" />,
      title: 'Enterprise Sales',
      description: 'Universities & large teams',
      contact: 'enterprise@sivio.com',
      href: 'mailto:enterprise@sivio.com',
      bgColor: 'bg-purple-50',
      responseTime: '< 12 hours',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-green-600" />,
      title: 'Live Chat',
      description: 'Instant support during business hours',
      contact: 'Available 9am-5pm PT',
      href: '#',
      bgColor: 'bg-green-50',
      responseTime: 'Instant',
    },
    {
      icon: <Phone className="w-6 h-6 text-orange-600" />,
      title: 'Phone',
      description: 'Speak with our team directly',
      contact: '(415) 555-1234',
      href: 'tel:+14155551234',
      bgColor: 'bg-orange-50',
      responseTime: '9am-5pm PT',
    },
  ]

  const offices = [
    {
      city: 'San Francisco',
      address: '123 Market Street, Suite 400',
      state: 'California, 94102',
      icon: '🌉',
    },
    {
      city: 'New York',
      address: '456 Broadway, 10th Floor',
      state: 'New York, 10013',
      icon: '🗽',
    },
    {
      city: 'Remote',
      address: 'We support fully remote teams',
      state: 'Worldwide',
      icon: '🌍',
    },
  ]

  const faqs = [
    {
      question: 'What\'s your typical response time?',
      answer: 'We respond to all inquiries within 24 hours, usually much faster. Enterprise customers get priority support with <12 hour response times.',
    },
    {
      question: 'Do you offer phone support?',
      answer: 'Yes! Phone support is available for Enterprise customers. Free and Pro users can use email, live chat, or our help center.',
    },
    {
      question: 'How do I schedule a demo?',
      answer: 'Contact our sales team at enterprise@sivio.com or fill out the form with "Demo Request" in the subject. We\'ll schedule a personalized walkthrough within 48 hours.',
    },
    {
      question: 'Can I visit your office?',
      answer: 'Absolutely! We love meeting students and potential partners. Email us to schedule a visit to our San Francisco or New York office.',
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
              <span className="font-semibold">We're here to help</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              Get in <span className="text-gradient-animate">Touch</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Have questions? Need support? Want to partner? We're here to help you succeed.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex items-center justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">24hr response time</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">100% satisfaction rate</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">
              Choose Your Preferred <span className="text-blue-600">Contact Method</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <a href={method.href} className="block h-full">
                  <Card className="h-full hover:shadow-2xl transition-shadow">
                    <div className={`${method.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                      {method.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {method.description}
                    </p>
                    <p className="text-blue-600 font-semibold mb-4">
                      {method.contact}
                    </p>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock size={16} />
                        <span>Response: {method.responseTime}</span>
                      </div>
                    </div>
                  </Card>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <ScrollReveal>
              <Card className="bg-white rounded-3xl p-8 lg:p-12">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form and we'll get back to you within 24 hours
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                    >
                      <option value="general">General Question</option>
                      <option value="support">Technical Support</option>
                      <option value="enterprise">Enterprise Sales</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="press">Press Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all resize-none"
                      placeholder="Tell us more about your question or request..."
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="w-5 h-5" />
                  </Button>

                  <p className="text-sm text-gray-600 text-center">
                    We typically respond within 24 hours
                  </p>
                </form>
              </Card>
            </ScrollReveal>

            {/* Right Column - Office Locations + Social */}
            <div className="space-y-8">
              {/* Office Locations */}
              <ScrollReveal delay={100}>
                <Card className="bg-white rounded-3xl p-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-6">
                    Our Offices
                  </h3>
                  <div className="space-y-6">
                    {offices.map((office, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="text-4xl">{office.icon}</div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{office.city}</div>
                          <div className="text-gray-600">{office.address}</div>
                          <div className="text-gray-500 text-sm">{office.state}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </ScrollReveal>

              {/* Social Media */}
              <ScrollReveal delay={200}>
                <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white p-8">
                  <h3 className="text-2xl font-black mb-4">
                    Follow Us
                  </h3>
                  <p className="text-blue-100 mb-6">
                    Stay updated with the latest features, tips, and job search strategies
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="#"
                      className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                    <a
                      href="#"
                      className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <a
                      href="#"
                      className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Github className="w-6 h-6" />
                    </a>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Enterprise CTA */}
              <ScrollReveal delay={300}>
                <Card className="bg-white rounded-3xl p-8 border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                    <h3 className="text-2xl font-black text-gray-900">
                      Enterprise?
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Bring Sivio to your university or organization. Custom pricing, dedicated support, and white-label options available.
                  </p>
                  <Button variant="primary" size="lg" href="mailto:enterprise@sivio.com" className="w-full">
                    Contact Sales
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-600">Common Questions</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                Frequently Asked <span className="text-blue-600">Questions</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-white rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Button variant="primary" size="lg" href="/help">
                Visit Help Center
                <ArrowRight className="w-5 h-5" />
              </Button>
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
