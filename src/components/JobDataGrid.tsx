'use client'

import { useState } from 'react'
import {
  Check,
  Square,
  CheckSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Mail,
  Bookmark,
  Archive,
  ExternalLink,
  Users
} from 'lucide-react'

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
  category: string | null
}

interface JobDataGridProps {
  jobs: Job[]
  selectedJobs: Set<string>
  onSelectJob: (jobId: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onJobClick: (jobId: string) => void
  onSaveJob?: (jobId: string) => void
  savedJobIds?: Set<string>
}

type SortField = 'title' | 'company' | 'posted_date' | 'salary_min'
type SortDirection = 'asc' | 'desc'

export default function JobDataGrid({
  jobs,
  selectedJobs,
  onSelectJob,
  onSelectAll,
  onClearSelection,
  onJobClick,
  onSaveJob,
  savedJobIds = new Set()
}: JobDataGridProps) {
  const [sortField, setSortField] = useState<SortField>('posted_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showBulkActions, setShowBulkActions] = useState(false)

  const allSelected = jobs.length > 0 && jobs.every(job => selectedJobs.has(job.id))
  const someSelected = jobs.some(job => selectedJobs.has(job.id))

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1

    switch (sortField) {
      case 'title':
        return multiplier * a.title.localeCompare(b.title)
      case 'company':
        return multiplier * a.company.localeCompare(b.company)
      case 'posted_date':
        const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0
        const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0
        return multiplier * (dateA - dateB)
      case 'salary_min':
        return multiplier * ((a.salary_min || 0) - (b.salary_min || 0))
      default:
        return 0
    }
  })

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified'
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`
    if (min) return `$${(min / 1000).toFixed(0)}k+`
    return `Up to $${(max! / 1000).toFixed(0)}k`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return `${Math.floor(diffDays / 30)}mo ago`
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-400" />
    return sortDirection === 'asc' ?
      <ArrowUp size={14} className="text-blue-600" /> :
      <ArrowDown size={14} className="text-blue-600" />
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedJobs.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={onClearSelection}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 border border-gray-300 text-sm font-medium">
                <Bookmark size={16} />
                Save Selected
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 border border-gray-300 text-sm font-medium">
                <Mail size={16} />
                Create Outreach
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 border border-gray-300 text-sm font-medium">
                <Archive size={16} />
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-3">
                <button
                  onClick={allSelected ? onClearSelection : onSelectAll}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {allSelected ? (
                    <CheckSquare size={18} className="text-blue-600" />
                  ) : someSelected ? (
                    <Square size={18} className="text-blue-600" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Job Title
                  <SortIcon field="title" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('company')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Company
                  <SortIcon field="company" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('salary_min')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Salary
                  <SortIcon field="salary_min" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('posted_date')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Posted
                  <SortIcon field="posted_date" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedJobs.map((job) => (
              <tr
                key={job.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedJobs.has(job.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <button
                    onClick={() => onSelectJob(job.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {selectedJobs.has(job.id) ? (
                      <CheckSquare size={18} className="text-blue-600" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onJobClick(job.id)}
                    className="text-left"
                  >
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {job.job_type && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                              {job.job_type.replace('-', ' ')}
                            </span>
                          )}
                          {job.remote && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Remote
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">{job.company}</div>
                  {job.category && (
                    <div className="text-xs text-gray-500 mt-1">{job.category}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {job.location || 'Not specified'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(job.posted_date)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Apply"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => onJobClick(job.id)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Find Contacts"
                    >
                      <Users size={16} />
                    </button>
                    {onSaveJob && (
                      <button
                        onClick={() => onSaveJob(job.id)}
                        className={`p-1.5 rounded transition-colors ${
                          savedJobIds.has(job.id)
                            ? 'text-blue-600 hover:bg-blue-50'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Save"
                      >
                        <Bookmark size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No jobs found</p>
        </div>
      )}
    </div>
  )
}
