/**
 * JobDetailModal Component - Apify/LinkedIn Schema
 * Full job details modal with contact finder integration
 */

'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink, MapPin, DollarSign, Briefcase, CalendarDays, Bookmark, BookmarkCheck, Users, Building2, Plus, Zap, Target, CheckCircle2 } from 'lucide-react'
import ContactFinderModal from './ContactFinderModal'
import { getCompanyDomain } from '@/lib/utils/domain-guesser'
import type { Job } from '@/types/job'

interface JobDetailModalProps {
  jobId: string | null
  isOpen: boolean
  onClose: () => void
  isSaved?: boolean
  onSave?: (jobId: string) => Promise<void>
}

export default function JobDetailModal({ jobId, isOpen, onClose, isSaved = false, onSave }: JobDetailModalProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(isSaved)
  const [showContactFinder, setShowContactFinder] = useState(false)
  const [userCredits, setUserCredits] = useState(100)

  useEffect(() => {
    setSaved(isSaved)
  }, [isSaved])

  useEffect(() => {
    if (jobId && isOpen) {
      fetchJob()
      fetchUserCredits()
    }
  }, [jobId, isOpen])

  const fetchJob = async () => {
    if (!jobId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      const data = await response.json()
      setJob(data.job)
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!onSave || !jobId) return

    setSaving(true)
    try {
      await onSave(jobId)
      setSaved(!saved)
    } finally {
      setSaving(false)
    }
  }

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/user/credits')
      if (response.ok) {
        const data = await response.json()
        setUserCredits(data.credits || 100)
      }
    } catch (error) {
      console.error('Failed to fetch user credits:', error)
    }
  }

  // Action handlers - Templates for webhook integration
  const handleAddToCRM = async () => {
    if (!job) return
    console.log('Add to CRM clicked - webhook placeholder for job:', job.job_id)
    // TODO: POST to /api/crm/applications with job data
    alert('Adding to CRM... (Webhook integration coming soon)')
  }

  const handleAutoApply = async () => {
    if (!job) return
    console.log('Auto-apply clicked - webhook placeholder for job:', job.job_id)
    // TODO: POST to /api/applications/auto-apply with job data
    alert('Auto-applying... (Webhook integration coming soon)')
  }

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action} for job:`, job?.job_id)
    alert(`${action} action triggered (Webhook integration coming soon)`)
  }

  // time_posted is already formatted from LinkedIn (e.g., "2 days ago")
  // No need to parse/format, display as-is

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading job details...</p>
            </div>
          ) : job ? (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                <div className="flex gap-4 items-start">
                  {/* Company Logo */}
                  {job.company_logo_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={job.company_logo_url}
                        alt={job.company_name}
                        className="w-16 h-16 rounded object-contain bg-gray-50"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Title & Company */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {job.job_title}
                    </h2>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 size={18} className="text-blue-600" />
                      <p className="text-xl text-blue-600 font-medium">
                        {job.company_name}
                      </p>
                    </div>
                    {job.company_url && (
                      <a
                        href={job.company_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                      >
                        Company Page <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {onSave && (
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`p-2 rounded-full transition-colors ${
                          saved
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        aria-label={saved ? 'Remove bookmark' : 'Bookmark job'}
                      >
                        {saved ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Close modal"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Job Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                    <span>{job.location}</span>
                  </div>

                  {/* Employment Type */}
                  {job.employment_type && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Briefcase size={18} className="text-gray-400" />
                      <span>{job.employment_type}</span>
                    </div>
                  )}

                  {/* Salary Range */}
                  {job.salary_range && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign size={18} className="text-gray-400" />
                      <span>{job.salary_range}</span>
                    </div>
                  )}

                  {/* Seniority Level */}
                  {job.seniority_level && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {job.seniority_level}
                      </span>
                    </div>
                  )}

                  {/* Posted Date */}
                  {job.time_posted && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarDays size={16} className="text-gray-400" />
                      <span>{job.time_posted}</span>
                    </div>
                  )}

                  {/* Easy Apply Badge */}
                  {job.easy_apply && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                        <ExternalLink size={14} />
                        Easy Apply
                      </span>
                    </div>
                  )}

                  {/* Number of Applicants */}
                  {job.num_applicants && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users size={18} className="text-gray-400" />
                      <span>{job.num_applicants}</span>
                    </div>
                  )}

                  {/* Job Function */}
                  {job.job_function && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-sm text-gray-600">
                        Function: <span className="font-medium">{job.job_function}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Industries */}
                {job.industries && job.industries.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.industries.map((industry, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {job.job_description}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-blue-600" />
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={handleAddToCRM}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <Plus size={20} />
                      Add to CRM
                    </button>
                    <button
                      onClick={handleAutoApply}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <Zap size={20} />
                      Auto-Apply
                    </button>
                    <button
                      onClick={() => setShowContactFinder(true)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <Target size={20} />
                      Find Best Contacts
                    </button>
                    <a
                      href={job.apply_url || job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      Apply on LinkedIn
                      <ExternalLink size={20} />
                    </a>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleQuickAction('Schedule Interview')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
                    >
                      <Calendar size={16} />
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => handleQuickAction('Set Reminder')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Set Reminder
                    </button>
                    <button
                      onClick={() => handleQuickAction('Share')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-600">Job not found</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Finder Modal */}
      {job && (
        <ContactFinderModal
          isOpen={showContactFinder}
          onClose={() => setShowContactFinder(false)}
          jobId={job.job_id}
          companyName={job.company_name}
          companyDomain={getCompanyDomain(job.job_url || job.company_url, job.company_name)}
          jobTitle={job.job_title}
          jobDescription={job.job_description || undefined}
          jobType={job.employment_type || undefined}
          location={job.location || undefined}
          userCredits={userCredits}
          onCreditsUpdate={setUserCredits}
        />
      )}
    </div>
  )
}
