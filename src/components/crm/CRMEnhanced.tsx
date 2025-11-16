'use client'

/**
 * CRM Enhanced Wrapper
 * Adds table view and Contact Finder to existing CRM Kanban
 * This wraps the existing CRM functionality without breaking it
 */

import { useState } from 'react'
import { LayoutGrid, List, Users } from 'lucide-react'
import ApplicationsTable from './ApplicationsTable'
import ContactFinderModal from '../contact-finder/ContactFinderModal'

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

interface CRMEnhancedProps {
  applications: Application[]
  userCredits: number
  onRefresh: () => void
  kanbanView: React.ReactNode
  onOpenDetails: (app: Application) => void
  onDelete: (id: string) => void
}

export default function CRMEnhanced({
  applications,
  userCredits,
  onRefresh,
  kanbanView,
  onOpenDetails,
  onDelete,
}: CRMEnhancedProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isContactFinderOpen, setIsContactFinderOpen] = useState(false)

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.length === applications.length ? [] : applications.map(app => app.id)
    )
  }

  const handleContactFinderSuccess = () => {
    onRefresh()
    setSelectedIds([])
  }

  const selectedApplications = applications.filter(app =>
    selectedIds.includes(app.id)
  )

  return (
    <>
      {/* View Toggle & Contact Finder Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={18} className="inline mr-2 -mt-0.5" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={18} className="inline mr-2 -mt-0.5" />
            Table
          </button>
        </div>

        {viewMode === 'table' && selectedIds.length > 0 && (
          <button
            onClick={() => setIsContactFinderOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Users size={20} />
            Contact Finder ({selectedIds.length})
          </button>
        )}
      </div>

      {/* View Content */}
      {viewMode === 'kanban' && kanbanView}

      {viewMode === 'table' && (
        <ApplicationsTable
          applications={applications}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenDetails={onOpenDetails}
          onDelete={onDelete}
        />
      )}

      {/* Contact Finder Modal */}
      <ContactFinderModal
        isOpen={isContactFinderOpen}
        onClose={() => setIsContactFinderOpen(false)}
        selectedApplications={selectedApplications}
        userCredits={userCredits}
        onSuccess={handleContactFinderSuccess}
      />
    </>
  )
}
