'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, MapPin, Calendar, Briefcase, MoreVertical, Trash2, Eye } from 'lucide-react'

interface Note {
  id: string
  text: string
  date: string
}

interface Application {
  id: string
  job_id: string
  job_title: string
  company_name: string
  company_logo_url?: string | null
  location?: string | null
  employment_type?: string | null
  seniority_level?: string | null
  salary_range?: string | null
  stage: string
  status: string
  applied_date: string
  upcoming_interview?: string | null
  notes: Note[]
  created_at: string
}

interface ApplicationsTableProps {
  applications: Application[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onOpenDetails: (app: Application) => void
  onDelete: (id: string) => void
}

const STAGE_LABELS: Record<string, string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

const STAGE_COLORS: Record<string, string> = {
  applied: 'bg-gray-100 text-gray-700',
  interviewing: 'bg-blue-100 text-blue-700',
  offer: 'bg-green-100 text-green-700',
  accepted: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ApplicationsTable({
  applications,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenDetails,
  onDelete,
}: ApplicationsTableProps) {
  const [showActionsId, setShowActionsId] = useState<string | null>(null)

  const allSelected = applications.length > 0 && selectedIds.length === applications.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Checkbox Column */}
              <th className="w-12 px-4 py-4">
                <button
                  onClick={onToggleSelectAll}
                  className="flex items-center justify-center w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                >
                  {allSelected ? (
                    <CheckCircle2 size={20} className="text-blue-600" />
                  ) : someSelected ? (
                    <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                  ) : (
                    <Circle size={20} className="text-gray-300" />
                  )}
                </button>
              </th>

              {/* Company Column */}
              <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">
                Company
              </th>

              {/* Position Column */}
              <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">
                Position
              </th>

              {/* Location Column */}
              <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">
                Location
              </th>

              {/* Date Applied Column */}
              <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">
                Date Applied
              </th>

              {/* Status Column */}
              <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">
                Status
              </th>

              {/* Actions Column */}
              <th className="w-16 px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => {
              const isSelected = selectedIds.includes(app.id)
              const showActions = showActionsId === app.id

              return (
                <tr
                  key={app.id}
                  className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelect(app.id)
                      }}
                      className="flex items-center justify-center w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                    >
                      {isSelected ? (
                        <CheckCircle2 size={20} className="text-blue-600" />
                      ) : (
                        <Circle size={20} className="text-gray-300" />
                      )}
                    </button>
                  </td>

                  {/* Company */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {app.company_name[0]}
                      </div>
                      <div className="font-semibold text-gray-900">{app.company_name}</div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 max-w-xs truncate">
                      {app.job_title}
                    </div>
                    {app.employment_type && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <Briefcase size={12} />
                        {app.employment_type}
                      </div>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-4">
                    {app.location ? (
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <MapPin size={14} className="text-gray-400" />
                        {app.location}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>

                  {/* Date Applied */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(app.applied_date)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STAGE_COLORS[app.stage] || 'bg-gray-100 text-gray-700'}`}>
                      {STAGE_LABELS[app.stage] || app.stage}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowActionsId(showActions ? null : app.id)
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>

                    {showActions && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowActionsId(null)}
                        />

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenDetails(app)
                              setShowActionsId(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(app.id)
                              setShowActionsId(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-1">No applications found</p>
            <p className="text-sm">Start applying to jobs to see them here!</p>
          </div>
        )}
      </div>
    </div>
  )
}
