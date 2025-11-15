/**
 * CRM Page - Application Pipeline Kanban Board (REAL DATA)
 * Drag-and-drop Kanban board for tracking job applications
 * Connected to Supabase database via API routes
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core'
import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  Briefcase,
  MessageSquare,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Target,
  X,
  Trash2,
  CheckCircle2
} from 'lucide-react'

// Application stages
const STAGES = [
  { id: 'applied', label: 'Applied', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  { id: 'interviewing', label: 'Interviewing', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  { id: 'offer', label: 'Offer', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  { id: 'accepted', label: 'Accepted', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  { id: 'rejected', label: 'Rejected', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
]

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

// Draggable Application Card Component
function ApplicationCard({ application, onOpen, onDelete }: { application: Application; onOpen: () => void; onDelete: () => void }) {
  const [showActions, setShowActions] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-4 cursor-pointer border border-gray-200 hover:border-blue-300 relative"
    >
      {/* Company Logo Placeholder */}
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 mb-3 flex items-center justify-center text-white font-bold text-xl">
        {application.company_name[0]}
      </div>

      {/* Job Title & Company */}
      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">
        {application.job_title}
      </h3>
      <p className="text-blue-600 font-semibold text-sm mb-2">{application.company_name}</p>

      {/* Applied Date */}
      <p className="text-gray-500 text-xs mb-3">
        Applied {new Date(application.applied_date).toLocaleDateString()}
      </p>

      {/* Status Badge */}
      <div className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full mb-3">
        {application.status}
      </div>

      {/* Upcoming Interview */}
      {application.upcoming_interview && (
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-3">
          <Calendar size={12} />
          <span>{new Date(application.upcoming_interview).toLocaleDateString()} at {new Date(application.upcoming_interview).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
          title="Add Note"
        >
          <MessageSquare size={14} className="text-gray-600" />
        </button>
        <div className="relative ml-auto">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="More Actions"
          >
            <MoreHorizontal size={14} className="text-gray-600" />
          </button>
          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                  if (confirm('Are you sure you want to delete this application?')) {
                    onDelete()
                  }
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Droppable Column Component
function KanbanColumn({ stage, applications, children }: { stage: typeof STAGES[0]; applications: Application[]; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className={`${stage.bgColor} rounded-xl p-4 mb-4 ${isOver ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-center justify-between">
          <h2 className={`${stage.textColor} font-black text-lg`}>
            {stage.label}
          </h2>
          <span className={`${stage.textColor} font-bold text-sm bg-white/50 px-2 py-1 rounded-full`}>
            {applications.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="space-y-3 min-h-[200px]">
        {children}
      </div>
    </div>
  )
}

export default function CRMPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    fetchApplications()
  }, [isLoaded, isSignedIn, router])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/applications')
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications || [])
      } else {
        console.error('Failed to fetch applications:', data.error)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end - update stage via API
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const appId = active.id as string
    const newStage = over.id as string

    // Optimistically update UI
    setApplications(apps =>
      apps.map(app =>
        app.id === appId ? { ...app, stage: newStage } : app
      )
    )

    setActiveId(null)

    // Update via API
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      })

      if (!response.ok) {
        // Revert on error
        fetchApplications()
        alert('Failed to update application stage')
      }
    } catch (error) {
      console.error('Error updating stage:', error)
      fetchApplications()
      alert('Failed to update application stage')
    }
  }

  // Delete application
  const deleteApplication = async (appId: string) => {
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApplications(apps => apps.filter(app => app.id !== appId))
      } else {
        alert('Failed to delete application')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Failed to delete application')
    }
  }

  // Calculate stats
  const stats = {
    total: applications.length,
    interviews: applications.filter(a => a.stage === 'interviewing').length,
    offers: applications.filter(a => a.stage === 'offer' || a.stage === 'accepted').length,
    interviewRate: applications.length > 0
      ? Math.round((applications.filter(a => a.stage === 'interviewing' || a.stage === 'offer' || a.stage === 'accepted').length / applications.length) * 100)
      : 0,
    avgTimeToInterview: 12, // TODO: Calculate from data
  }

  // Get upcoming interviews
  const upcomingInterviews = applications
    .filter(a => a.upcoming_interview)
    .sort((a, b) => new Date(a.upcoming_interview!).getTime() - new Date(b.upcoming_interview!).getTime())
    .slice(0, 3)

  // Filter applications
  const filteredApplications = applications.filter(app =>
    app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group applications by stage
  const groupedApplications = STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredApplications.filter(app => app.stage === stage.id)
    return acc
  }, {} as Record<string, Application[]>)

  const openDetailModal = (app: Application) => {
    setSelectedApp(app)
    setIsDetailModalOpen(true)
  }

  const openNoteModal = (app: Application) => {
    setSelectedApp(app)
    setIsNoteModalOpen(true)
  }

  const saveNote = async () => {
    if (!selectedApp || !newNote.trim()) return

    const note: Note = {
      id: `n${Date.now()}`,
      text: newNote,
      date: new Date().toISOString().split('T')[0]
    }

    const updatedNotes = [...selectedApp.notes, note]

    try {
      const response = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: updatedNotes })
      })

      if (response.ok) {
        setApplications(apps =>
          apps.map(app =>
            app.id === selectedApp.id
              ? { ...app, notes: updatedNotes }
              : app
          )
        )
        setNewNote('')
        setIsNoteModalOpen(false)
      } else {
        alert('Failed to save note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note')
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <MainNav />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          {/* Top Row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Application Pipeline
              </h1>
              <p className="text-lg text-gray-600">
                {stats.total} total • {stats.interviews} interviews • {stats.offers} offers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                variant="gradient"
                size="md"
                href="/jobs"
              >
                <Plus size={18} />
                Find More Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="xl" />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={64} />}
            title="No Applications Yet"
            description="Start tracking your job applications by marking jobs as applied on the Jobs page"
            action={{
              label: 'Browse Jobs',
              onClick: () => router.push('/jobs')
            }}
          />
        ) : (
          <div className="flex gap-6">
            {/* Left Sidebar */}
            <div className="w-80 flex-shrink-0">
              {/* Pipeline Stats */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Pipeline Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Interview Rate</span>
                      <span className={`text-sm font-bold ${stats.interviewRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.interviewRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${stats.interviewRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${stats.interviewRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Avg Time to Interview</div>
                    <div className="text-2xl font-black text-gray-900">{stats.avgTimeToInterview} days</div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Offers Received</div>
                    <div className="text-2xl font-black text-gray-900">{stats.offers}</div>
                  </div>
                </div>
              </div>

              {/* Upcoming Interviews */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} />
                  Upcoming Interviews
                </h3>
                {upcomingInterviews.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingInterviews.map(app => (
                      <div key={app.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="font-semibold text-gray-900 text-sm mb-1">{app.company_name}</div>
                        <div className="text-xs text-gray-600 mb-2">{app.job_title}</div>
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <Calendar size={12} />
                          <span>{new Date(app.upcoming_interview!).toLocaleDateString()}</span>
                          <span>{new Date(app.upcoming_interview!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No upcoming interviews
                  </div>
                )}
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto">
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
              >
                <div className="flex gap-4 pb-4">
                  {STAGES.map(stage => (
                    <KanbanColumn
                      key={stage.id}
                      stage={stage}
                      applications={groupedApplications[stage.id] || []}
                    >
                      {groupedApplications[stage.id]?.map(app => (
                        <ApplicationCard
                          key={app.id}
                          application={app}
                          onOpen={() => openDetailModal(app)}
                          onDelete={() => deleteApplication(app.id)}
                        />
                      ))}
                      {groupedApplications[stage.id]?.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          <Target size={32} className="mx-auto mb-2 opacity-50" />
                          No applications
                        </div>
                      )}
                    </KanbanColumn>
                  ))}
                </div>
              </DndContext>
            </div>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedApp.job_title}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedApp.company_name}</h3>
              <p className="text-gray-600">{selectedApp.location}</p>
              {selectedApp.salary_range && (
                <p className="text-green-600 font-semibold mt-2">{selectedApp.salary_range}</p>
              )}
            </div>

            {selectedApp.upcoming_interview && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                  <Calendar size={18} />
                  Upcoming Interview
                </div>
                <p className="text-blue-900">
                  {new Date(selectedApp.upcoming_interview).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {new Date(selectedApp.upcoming_interview).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900">Notes</h4>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    openNoteModal(selectedApp)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  + Add Note
                </button>
              </div>
              {selectedApp.notes.length > 0 ? (
                <div className="space-y-2">
                  {selectedApp.notes.map(note => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-gray-900 text-sm mb-1">{note.text}</p>
                      <p className="text-gray-500 text-xs">{new Date(note.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No notes yet</p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Activity Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Applied</p>
                    <p className="text-xs text-gray-500">{new Date(selectedApp.applied_date).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedApp.notes.map(note => (
                  <div key={note.id} className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Note added</p>
                      <p className="text-xs text-gray-500">{new Date(note.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Note Modal */}
      {selectedApp && (
        <Modal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          title="Add Note"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add your notes about this application..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsNoteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={saveNote}
              >
                Save Note
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
