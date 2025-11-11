'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck, MapPin, DollarSign, Briefcase, CalendarDays } from 'lucide-react'

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    location: string | null
    salary_min: number | null
    salary_max: number | null
    job_type: string | null
    remote: boolean
    posted_date: string | null
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
      await onSave(job.id)
      setSaved(!saved)
    } finally {
      setSaving(false)
    }
  }

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
    }
    if (job.salary_min) return `$${(job.salary_min / 1000).toFixed(0)}k+`
    return `Up to $${(job.salary_max! / 1000).toFixed(0)}k`
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    const now = new Date()
    const posted = new Date(date)
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 cursor-pointer border border-gray-100 hover:border-blue-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-lg text-blue-600 font-medium">{job.company}</p>
        </div>
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
            {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {job.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            <span>{job.location}</span>
            {job.remote && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Remote
              </span>
            )}
          </div>
        )}

        {formatSalary() && (
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gray-400" />
            <span>{formatSalary()}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {job.job_type && (
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-gray-400" />
              <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
            </div>
          )}

          {job.posted_date && (
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-gray-400" />
              <span>{formatDate(job.posted_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
