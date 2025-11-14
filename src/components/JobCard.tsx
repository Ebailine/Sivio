/**
 * JobCard Component - Apify/LinkedIn Schema
 * Displays job information in a card format for browse/search results
 */

'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck, MapPin, DollarSign, Briefcase, CalendarDays, ExternalLink } from 'lucide-react'
import type { JobCardData } from '@/types/job'

interface JobCardProps {
  job: JobCardData | {
    job_id: string
    job_title: string
    company_name: string
    company_logo_url?: string | null
    location: string
    employment_type?: string | null
    seniority_level?: string | null
    salary_range?: string | null
    time_posted: string
    easy_apply?: boolean
  }
  isSaved?: boolean
  onSave?: (jobId: string) => Promise<void>
  onClick?: () => void
}

export default function JobCard({ job, isSaved = false, onSave, onClick }: JobCardProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(isSaved)

  // Sync internal state with prop when it changes
  useEffect(() => {
    setSaved(isSaved)
  }, [isSaved])

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onSave) return

    setSaving(true)
    try {
      await onSave(job.job_id)
      setSaved(!saved)
    } finally {
      setSaving(false)
    }
  }

  // time_posted is already human-readable from LinkedIn (e.g., "2 days ago")
  // No need to format, just display as-is

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 cursor-pointer border border-gray-100 hover:border-blue-300"
    >
      {/* Header with company logo, title, and bookmark */}
      <div className="flex gap-4 mb-3">
        {/* Company Logo */}
        {job.company_logo_url && (
          <div className="flex-shrink-0">
            <img
              src={job.company_logo_url}
              alt={job.company_name}
              className="w-12 h-12 rounded object-contain bg-gray-50"
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Title and Company */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
            {job.job_title}
          </h3>
          <p className="text-lg text-blue-600 font-medium truncate">
            {job.company_name}
          </p>
        </div>

        {/* Bookmark Button */}
        {onSave && (
          <div className="flex-shrink-0">
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
              {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="space-y-2 text-sm text-gray-600">
        {/* Location & Easy Apply */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          {job.easy_apply && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <ExternalLink size={12} />
              Easy Apply
            </span>
          )}
        </div>

        {/* Salary */}
        {job.salary_range && (
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gray-400" />
            <span>{job.salary_range}</span>
          </div>
        )}

        {/* Employment Type & Seniority */}
        <div className="flex items-center gap-4 flex-wrap">
          {job.employment_type && (
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-gray-400" />
              <span>{job.employment_type}</span>
            </div>
          )}

          {job.seniority_level && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {job.seniority_level}
              </span>
            </div>
          )}
        </div>

        {/* Posted Date */}
        {job.time_posted && (
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays size={16} className="text-gray-400" />
            <span>{job.time_posted}</span>
          </div>
        )}
      </div>
    </div>
  )
}
