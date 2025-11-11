'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink, MapPin, DollarSign, Briefcase, CalendarDays, Bookmark, BookmarkCheck } from 'lucide-react'

interface Job {
  id: string
  title: string
  company: string
  location: string | null
  description: string | null
  url: string | null
  salary_min: number | null
  salary_max: number | null
  job_type: string | null
  remote: boolean
  posted_date: string | null
  source: string | null
}

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
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading job details...</p>
            </div>
          ) : job ? (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <p className="text-xl text-blue-600 font-medium">{job.company}</p>
                </div>
                <div className="flex gap-2">
                  {onSave && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`p-2 rounded-full transition-colors ${
                        saved
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {saved ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {job.location && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={18} className="text-gray-400" />
                      <span>{job.location}</span>
                      {job.remote && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Remote
                        </span>
                      )}
                    </div>
                  )}

                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign size={18} className="text-gray-400" />
                      <span>
                        {job.salary_min && job.salary_max
                          ? `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
                          : job.salary_min
                          ? `$${(job.salary_min / 1000).toFixed(0)}k+`
                          : `Up to $${(job.salary_max! / 1000).toFixed(0)}k`}
                      </span>
                    </div>
                  )}

                  {job.job_type && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Briefcase size={18} className="text-gray-400" />
                      <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
                    </div>
                  )}

                  {job.posted_date && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarDays size={18} className="text-gray-400" />
                      <span>
                        Posted{' '}
                        {(() => {
                          const now = new Date()
                          const posted = new Date(job.posted_date)
                          const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24))
                          if (diffDays === 0) return 'today'
                          if (diffDays === 1) return 'yesterday'
                          if (diffDays < 7) return `${diffDays} days ago`
                          if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
                          return `${Math.floor(diffDays / 30)} months ago`
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {job.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  </div>
                )}

                {/* Apply Button */}
                {job.url && (
                  <div className="pt-6 border-t border-gray-200">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Apply on Company Website
                      <ExternalLink size={18} />
                    </a>
                    {job.source && (
                      <p className="mt-2 text-sm text-gray-500">Source: {job.source}</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-600">Job not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
