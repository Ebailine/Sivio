/**
 * CRM Page - Application & Outreach Management
 * The most advanced, seamless CRM for student job applications
 * Inspired by Linear, Apollo.io, and Outreach.io - but 1000x better
 */

'use client'

import { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'

// Force dynamic rendering to avoid SSR issues with Clerk
export const dynamic = 'force-dynamic'
import {
  Briefcase,
  Users,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  MoreVertical,
  Edit,
  Trash,
  Send,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Zap,
  Award,
} from 'lucide-react'
import type { Application, CRMStats, Contact, ApplicationStatus, OutreachStatus } from '@/types/crm'

export default function CRMPage() {
  const [view, setView] = useState<'applications' | 'outreach'>('applications')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showOutreachPanel, setShowOutreachPanel] = useState(false)

  // Mock data - replace with real API calls
  const [stats, setStats] = useState<CRMStats>({
    total_applications: 47,
    active_applications: 23,
    interviews_scheduled: 8,
    offers_received: 2,
    total_contacts: 156,
    active_outreach: 34,
    response_rate: 32.5,
    avg_response_time: 2.3,
  })

  const [applications, setApplications] = useState<Application[]>([
    // Mock data - this will come from Supabase
    {
      id: '1',
      job_id: 'test-1',
      job_title: 'Software Engineering Intern',
      company_name: 'Google',
      company_logo_url: 'https://logo.clearbit.com/google.com',
      location: 'Mountain View, CA',
      employment_type: 'Internship',
      salary_range: '$8K - $10K/month',
      status: 'interview',
      application_method: 'auto_apply',
      applied_date: '2025-01-10',
      last_updated: '2025-01-12',
      contacts: [
        {
          id: 'c1',
          name: 'Sarah Chen',
          title: 'Engineering Recruiter',
          email: 'sarah.chen@google.com',
          linkedin_url: 'https://linkedin.com/in/sarahchen',
          company: 'Google',
          relevance_score: 95,
          added_date: '2025-01-10',
          last_contacted: '2025-01-11',
          outreach_status: 'responded',
          response_count: 2,
        },
      ],
      outreach_activities: [],
      priority: 'high',
      tags: ['FAANG', 'SWE'],
      job_url: 'https://linkedin.com/jobs/view/123',
      easy_apply: true,
    },
  ])

  const statusColors = {
    saved: 'bg-gray-100 text-gray-700 border-gray-300',
    applied: 'bg-blue-100 text-blue-700 border-blue-300',
    screening: 'bg-purple-100 text-purple-700 border-purple-300',
    interview: 'bg-orange-100 text-orange-700 border-orange-300',
    offer: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    accepted: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }

  const outreachStatusColors = {
    not_started: 'bg-gray-100 text-gray-600',
    researching: 'bg-blue-100 text-blue-600',
    contacted: 'bg-purple-100 text-purple-600',
    responded: 'bg-green-100 text-green-600',
    meeting_scheduled: 'bg-orange-100 text-orange-600',
    follow_up: 'bg-yellow-100 text-yellow-600',
    converted: 'bg-emerald-100 text-emerald-600',
    closed: 'bg-gray-100 text-gray-500',
  }

  const handleAddToCRM = () => {
    // Template for webhook integration
    console.log('Add to CRM clicked - webhook placeholder')
  }

  const handleFindContacts = (applicationId: string) => {
    // Template for webhook integration
    console.log('Find contacts clicked for:', applicationId)
  }

  const handleAutoApply = (jobId: string) => {
    // Template for webhook integration
    console.log('Auto-apply clicked for:', jobId)
  }

  const handleSendOutreach = (contactId: string) => {
    // Template for webhook integration
    console.log('Send outreach clicked for contact:', contactId)
  }

  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplications(apps =>
      apps.map(app =>
        app.id === appId ? { ...app, status: newStatus, last_updated: new Date().toISOString() } : app
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Top Navigation */}
      <NavBar activePage="crm" />

      {/* CRM Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Application CRM
              </h1>
              <p className="text-gray-600 mt-1">Track applications, manage outreach, land your dream internship</p>
            </div>
            <button
              onClick={handleAddToCRM}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              Add Application
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Briefcase size={24} className="opacity-80" />
                <ArrowUpRight size={20} className="opacity-60" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.total_applications}</div>
              <div className="text-blue-100 text-sm">Total Applications</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Activity size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.active_applications}</div>
              <div className="text-purple-100 text-sm">Active Pipeline</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={24} className="opacity-80" />
                <CheckCircle2 size={20} className="opacity-60" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.interviews_scheduled}</div>
              <div className="text-orange-100 text-sm">Interviews Scheduled</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Award size={24} className="opacity-80" />
                <Star size={20} className="opacity-60" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.offers_received}</div>
              <div className="text-green-100 text-sm">Offers Received</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* View Toggle & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* View Toggle */}
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setView('applications')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  view === 'applications'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Briefcase size={18} className="inline mr-2" />
                Applications
              </button>
              <button
                onClick={() => setView('outreach')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  view === 'outreach'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users size={18} className="inline mr-2" />
                Outreach
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-1 gap-3 w-full lg:w-auto lg:max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search applications, companies, or contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications View */}
        {view === 'applications' && (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-300/50 transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    {app.company_logo_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={app.company_logo_url}
                          alt={app.company_name}
                          className="w-16 h-16 rounded-xl object-contain bg-gray-50 border border-gray-100"
                        />
                      </div>
                    )}

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{app.job_title}</h3>
                          <p className="text-lg text-blue-600 font-semibold">{app.company_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${statusColors[app.status]}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          {app.priority === 'high' && (
                            <Star size={20} className="text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Briefcase size={16} />
                          {app.employment_type}
                        </span>
                        <span>{app.location}</span>
                        {app.salary_range && (
                          <span className="font-semibold text-green-600">{app.salary_range}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          Applied {new Date(app.applied_date).toLocaleDateString()}
                        </span>
                        {app.application_method === 'auto_apply' && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <Zap size={12} />
                            Auto-Applied
                          </span>
                        )}
                      </div>

                      {/* Contacts Preview */}
                      {app.contacts.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <Users size={16} className="text-blue-600" />
                              Key Contacts ({app.contacts.length})
                            </h4>
                            <button
                              onClick={() => handleFindContacts(app.id)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                            >
                              Find More
                              <ChevronRight size={16} />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {app.contacts.slice(0, 2).map((contact) => (
                              <div key={contact.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{contact.name}</div>
                                  <div className="text-sm text-gray-600">{contact.title}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${outreachStatusColors[contact.outreach_status]}`}>
                                    {contact.outreach_status.replace('_', ' ')}
                                  </span>
                                  <button
                                    onClick={() => handleSendOutreach(contact.id)}
                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Send size={16} className="text-blue-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'screening')}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Update Status
                        </button>
                        <button
                          onClick={() => handleFindContacts(app.id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                          <Target size={16} />
                          Find Best Contacts
                        </button>
                        <button
                          onClick={() => setShowOutreachPanel(true)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                          <Mail size={16} />
                          Start Outreach
                        </button>
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <ExternalLink size={16} />
                          View Job
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/50">
                <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-6">Start tracking your dream internship applications</p>
                <button
                  onClick={handleAddToCRM}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <Plus size={20} />
                  Add Your First Application
                </button>
              </div>
            )}
          </div>
        )}

        {/* Outreach View */}
        {view === 'outreach' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8">
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Outreach Management</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Manage all your networking contacts, track email sequences, LinkedIn messages, and follow-ups in one place.
                Apollo.io-style outreach automation coming soon!
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="bg-blue-50 rounded-xl p-6 text-left">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total_contacts}</div>
                  <div className="text-sm text-gray-600">Total Contacts</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-left">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.response_rate}%</div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 text-left">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stats.avg_response_time}d</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
