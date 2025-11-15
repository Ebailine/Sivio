/**
 * JobDetailModal Component - Enhanced with new UI
 * Full job details modal with save functionality
 */

'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink, MapPin, DollarSign, Briefcase, CalendarDays, Bookmark, BookmarkCheck, Users, Building2 } from 'lucide-react'
import { Button } from './ui/Button'
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

  useEffect(() => {
    setSaved(isSaved)
  }, [isSaved])

  useEffect(() => {
    if (jobId && isOpen) {
      fetchJob()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop with fade-in */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Modal with slide-in animation */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading job details...</p>
            </div>
          ) : job ? (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 rounded-t-2xl">
                <div className="flex gap-4 items-start">
                  {/* Company Logo */}
                  {job.company_logo_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={job.company_logo_url}
                        alt={job.company_name}
                        className="w-16 h-16 rounded-lg object-contain bg-gray-50 p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Title & Company */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                      {job.job_title}
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <p className="text-xl text-blue-600 font-semibold">
                        {job.company_name}
                      </p>
                    </div>
                    {job.company_url && (
                      <a
                        href={job.company_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                      >
                        Visit Company Page <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {onSave && (
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`p-3 rounded-xl transition-all ${
                          saved
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:scale-110'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:scale-110'
                        }`}
                        aria-label={saved ? 'Remove bookmark' : 'Bookmark job'}
                      >
                        {saved ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-3 rounded-xl hover:bg-gray-100 transition-all hover:scale-110"
                      aria-label="Close modal"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Job Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="font-semibold text-gray-900">{job.location}</div>
                    </div>
                  </div>

                  {/* Employment Type */}
                  {job.employment_type && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Briefcase className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-xs text-gray-500">Type</div>
                        <div className="font-semibold text-gray-900">{job.employment_type}</div>
                      </div>
                    </div>
                  )}

                  {/* Salary Range */}
                  {job.salary_range && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-xs text-gray-500">Salary</div>
                        <div className="font-semibold text-gray-900">{job.salary_range}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-3">
                  {job.seniority_level && (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                      {job.seniority_level}
                    </span>
                  )}

                  {job.easy_apply && (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      <ExternalLink size={14} />
                      Easy Apply
                    </span>
                  )}

                  {job.num_applicants && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Users size={14} />
                      {job.num_applicants}
                    </span>
                  )}

                  {job.time_posted && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      <CalendarDays size={14} />
                      {job.time_posted}
                    </span>
                  )}
                </div>

                {/* Description */}
                {job.job_description && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description</h3>
                    <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                      {job.job_description}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.apply_url && (
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={() => window.open(job.apply_url, '_blank')}
                    >
                      <ExternalLink className="w-5 h-5" />
                      Apply on LinkedIn
                    </Button>
                  )}

                  {onSave && (
                    <Button
                      variant={saved ? 'secondary' : 'primary'}
                      size="lg"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Bookmark className="w-5 h-5" />
                      {saved ? 'Saved to CRM' : 'Save to CRM'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-600">Job not found</p>
              <Button variant="ghost" onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
