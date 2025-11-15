/**
 * JobCard Component - Enhanced with new UI components
 * Displays job information in a card format
 */

'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck, MapPin, DollarSign, Briefcase, CalendarDays, ExternalLink, Building2 } from 'lucide-react'
import { TiltCard } from './ui/TiltCard'
import { Button } from './ui/Button'

interface JobCardProps {
  job: {
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

  return (
    <TiltCard
      onClick={onClick}
      className="cursor-pointer group hover:border-blue-500 transition-colors h-full"
    >
      {/* Header with company logo and bookmark */}
      <div className="flex gap-4 mb-4">
        {/* Company Logo */}
        {job.company_logo_url && (
          <div className="flex-shrink-0">
            <img
              src={job.company_logo_url}
              alt={job.company_name}
              className="w-14 h-14 rounded-lg object-contain bg-gray-50 p-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Title and Company */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {job.job_title}
          </h3>
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold truncate">{job.company_name}</span>
          </div>
        </div>

        {/* Bookmark Button */}
        {onSave && (
          <div className="flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`p-2 rounded-full transition-all ${
                saved
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:scale-110'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:scale-110'
              }`}
              aria-label={saved ? 'Remove bookmark' : 'Bookmark job'}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        {/* Location & Easy Apply */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{job.location}</span>
          </div>
          {job.easy_apply && (
            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <ExternalLink size={12} />
              Easy Apply
            </span>
          )}
        </div>

        {/* Salary */}
        {job.salary_range && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>{job.salary_range}</span>
          </div>
        )}

        {/* Employment Type & Seniority */}
        <div className="flex items-center gap-3 flex-wrap">
          {job.employment_type && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>{job.employment_type}</span>
            </div>
          )}

          {job.seniority_level && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
              {job.seniority_level}
            </span>
          )}
        </div>

        {/* Posted Date */}
        {job.time_posted && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <span>{job.time_posted}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-100">
        <Button
          variant="gradient"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
          className="w-full"
        >
          View Details
        </Button>
      </div>
    </TiltCard>
  )
}
