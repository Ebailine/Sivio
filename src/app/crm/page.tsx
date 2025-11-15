/**
 * CRM Page - Application Pipeline Kanban Board
 * Drag-and-drop Kanban board for tracking job applications
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
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
  Archive,
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
  jobTitle: string
  company: string
  location: string
  appliedDate: string
  stage: string
  status: string
  notes: Note[]
  upcomingInterview?: string
  salary?: string
}

// Mock application data
const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    jobTitle: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA',
    appliedDate: '2025-01-10',
    stage: 'interviewing',
    status: 'Interview Scheduled',
    notes: [
      { id: 'n1', text: 'Had great call with recruiter Sarah', date: '2025-01-12' },
      { id: 'n2', text: 'Technical interview scheduled for next week', date: '2025-01-15' }
    ],
    upcomingInterview: '2025-01-25T14:00',
    salary: '$120k-$150k'
  },
  {
    id: '2',
    jobTitle: 'Product Manager Intern',
    company: 'Meta',
    location: 'Menlo Park, CA',
    appliedDate: '2025-01-08',
    stage: 'interviewing',
    status: 'Interview Scheduled',
    notes: [
      { id: 'n3', text: 'Recruiter said they loved my resume', date: '2025-01-09' }
    ],
    upcomingInterview: '2025-01-22T10:00',
    salary: '$110k-$140k'
  },
  {
    id: '3',
    jobTitle: 'Data Science Intern',
    company: 'Microsoft',
    location: 'Seattle, WA',
    appliedDate: '2025-01-12',
    stage: 'interviewing',
    status: 'Waiting for Response',
    notes: [],
    upcomingInterview: '2025-01-26T15:00',
    salary: '$100k-$130k'
  },
  {
    id: '4',
    jobTitle: 'Frontend Engineer Intern',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-15',
    stage: 'applied',
    status: 'Application Submitted',
    notes: [],
    salary: '$95k-$125k'
  },
  {
    id: '5',
    jobTitle: 'ML Engineer Intern',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-14',
    stage: 'applied',
    status: 'Application Submitted',
    notes: [
      { id: 'n4', text: 'Followed up with recruiter on LinkedIn', date: '2025-01-16' }
    ],
    salary: '$130k-$160k'
  },
  {
    id: '6',
    jobTitle: 'Backend Engineer Intern',
    company: 'Stripe',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-11',
    stage: 'applied',
    status: 'Application Submitted',
    notes: [],
    salary: '$105k-$135k'
  },
  {
    id: '7',
    jobTitle: 'SWE Intern',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    appliedDate: '2025-01-09',
    stage: 'applied',
    status: 'Application Submitted',
    notes: [],
    salary: '$110k-$140k'
  },
  {
    id: '8',
    jobTitle: 'Growth Intern',
    company: 'Notion',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-07',
    stage: 'applied',
    status: 'Application Submitted',
    notes: [],
    salary: '$85k-$115k'
  },
  {
    id: '9',
    jobTitle: 'Full Stack Intern',
    company: 'Figma',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-13',
    stage: 'offer',
    status: 'Offer Received',
    notes: [
      { id: 'n5', text: 'Received verbal offer!', date: '2025-01-18' },
      { id: 'n6', text: 'Waiting for written offer letter', date: '2025-01-18' }
    ],
    salary: '$115k base + equity'
  },
  {
    id: '10',
    jobTitle: 'Design Engineer Intern',
    company: 'Linear',
    location: 'Remote',
    appliedDate: '2024-12-20',
    stage: 'accepted',
    status: 'Accepted Offer',
    notes: [
      { id: 'n7', text: 'Signed offer letter!', date: '2025-01-05' }
    ],
    salary: '$95k + equity'
  },
  {
    id: '11',
    jobTitle: 'SWE Intern',
    company: 'Amazon',
    location: 'Seattle, WA',
    appliedDate: '2025-01-05',
    stage: 'rejected',
    status: 'Not Selected',
    notes: [
      { id: 'n8', text: 'Received rejection email after final interview', date: '2025-01-16' }
    ]
  },
  {
    id: '12',
    jobTitle: 'Product Intern',
    company: 'Uber',
    location: 'San Francisco, CA',
    appliedDate: '2025-01-06',
    stage: 'rejected',
    status: 'Not Selected',
    notes: []
  }
]

// Draggable Application Card Component
function ApplicationCard({ application, onOpen }: { application: Application; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-4 cursor-pointer border border-gray-200 hover:border-blue-300"
    >
      {/* Company Logo Placeholder */}
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 mb-3 flex items-center justify-center text-white font-bold text-xl">
        {application.company[0]}
      </div>

      {/* Job Title & Company */}
      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">
        {application.jobTitle}
      </h3>
      <p className="text-blue-600 font-semibold text-sm mb-2">{application.company}</p>

      {/* Applied Date */}
      <p className="text-gray-500 text-xs mb-3">
        Applied {new Date(application.appliedDate).toLocaleDateString()}
      </p>

      {/* Status Badge */}
      <div className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full mb-3">
        {application.status}
      </div>

      {/* Upcoming Interview */}
      {application.upcomingInterview && (
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-3">
          <Calendar size={12} />
          <span>{new Date(application.upcomingInterview).toLocaleDateString()} at {new Date(application.upcomingInterview).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
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
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
          title="Set Reminder"
        >
          <Clock size={14} className="text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="p-1.5 hover:bg-blue-50 rounded transition-colors ml-auto"
          title="More Actions"
        >
          <MoreHorizontal size={14} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}

// Droppable Column Component
function KanbanColumn({ stage, applications, children }: { stage: typeof STAGES[0]; applications: Application[]; children: React.ReactNode }) {
  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className={`${stage.bgColor} rounded-xl p-4 mb-4`}>
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

  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
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
  }, [isLoaded, isSignedIn, router])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const appId = active.id as string
    const newStage = over.id as string

    // Update application stage
    setApplications(apps =>
      apps.map(app =>
        app.id === appId ? { ...app, stage: newStage } : app
      )
    )

    setActiveId(null)
  }

  // Calculate stats
  const stats = {
    total: applications.length,
    interviews: applications.filter(a => a.stage === 'interviewing').length,
    offers: applications.filter(a => a.stage === 'offer' || a.stage === 'accepted').length,
    interviewRate: applications.length > 0
      ? Math.round((applications.filter(a => a.stage === 'interviewing' || a.stage === 'offer' || a.stage === 'accepted').length / applications.length) * 100)
      : 0,
    avgTimeToInterview: 12, // Mock data
  }

  // Get upcoming interviews
  const upcomingInterviews = applications
    .filter(a => a.upcomingInterview)
    .sort((a, b) => new Date(a.upcomingInterview!).getTime() - new Date(b.upcomingInterview!).getTime())
    .slice(0, 3)

  // Filter applications
  const filteredApplications = applications.filter(app =>
    app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.company.toLowerCase().includes(searchQuery.toLowerCase())
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

  const saveNote = () => {
    if (!selectedApp || !newNote.trim()) return

    const note: Note = {
      id: `n${Date.now()}`,
      text: newNote,
      date: new Date().toISOString().split('T')[0]
    }

    setApplications(apps =>
      apps.map(app =>
        app.id === selectedApp.id
          ? { ...app, notes: [...app.notes, note] }
          : app
      )
    )

    setNewNote('')
    setIsNoteModalOpen(false)
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <button className="p-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50">
                <Filter size={18} className="text-gray-600" />
              </button>
              <Button
                variant="gradient"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={18} />
                Add Application
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
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
                      <div className="font-semibold text-gray-900 text-sm mb-1">{app.company}</div>
                      <div className="text-xs text-gray-600 mb-2">{app.jobTitle}</div>
                      <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <Calendar size={12} />
                        <span>{new Date(app.upcomingInterview!).toLocaleDateString()}</span>
                        <span>{new Date(app.upcomingInterview!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
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
            >
              <div className="flex gap-4 pb-4">
                {STAGES.map(stage => (
                  <SortableContext
                    key={stage.id}
                    id={stage.id}
                    items={groupedApplications[stage.id]?.map(app => app.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <KanbanColumn
                      stage={stage}
                      applications={groupedApplications[stage.id] || []}
                    >
                      {groupedApplications[stage.id]?.map(app => (
                        <div key={app.id} data-id={app.id}>
                          <ApplicationCard
                            application={app}
                            onOpen={() => openDetailModal(app)}
                          />
                        </div>
                      ))}
                      {groupedApplications[stage.id]?.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          <Target size={32} className="mx-auto mb-2 opacity-50" />
                          No applications
                        </div>
                      )}
                    </KanbanColumn>
                  </SortableContext>
                ))}
              </div>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedApp.jobTitle}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedApp.company}</h3>
              <p className="text-gray-600">{selectedApp.location}</p>
              {selectedApp.salary && (
                <p className="text-green-600 font-semibold mt-2">{selectedApp.salary}</p>
              )}
            </div>

            {selectedApp.upcomingInterview && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                  <Calendar size={18} />
                  Upcoming Interview
                </div>
                <p className="text-blue-900">
                  {new Date(selectedApp.upcomingInterview).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {new Date(selectedApp.upcomingInterview).toLocaleTimeString('en-US', {
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
                    <p className="text-xs text-gray-500">{new Date(selectedApp.appliedDate).toLocaleDateString()}</p>
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

      {/* Add Application Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Application"
        maxWidth="lg"
      >
        <div className="text-center py-12">
          <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            Manual application entry is coming in Q1 2025
          </p>
          <Button variant="gradient" onClick={() => setIsAddModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  )
}
