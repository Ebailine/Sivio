'use client';

import { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  Tag,
  FileText,
  Edit3,
  Save,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Timeline } from './Timeline';
import { InterviewScheduler } from './InterviewScheduler';
import { TagManager } from '../shared/TagManager';

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  company_logo_url?: string;
  location?: string;
  employment_type?: string;
  seniority_level?: string;
  salary_range?: string;
  stage: string;
  status: string;
  applied_date: string;
  created_at: string;
  updated_at?: string;
  notes?: any[];
  upcoming_interview?: string;
  offer_date?: string;
  acceptance_date?: string;
  rejection_date?: string;
  tags?: string[];
}

interface ApplicationDetailModalEnhancedProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updates: Partial<Application>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

type TabType = 'overview' | 'timeline' | 'interviews' | 'tags';

export function ApplicationDetailModalEnhanced({
  application,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: ApplicationDetailModalEnhancedProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Application>>({});
  const [newNote, setNewNote] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!onUpdate) return;

    setIsSaving(true);
    try {
      await onUpdate(editedData);
      setIsEditing(false);
      setEditedData({});
    } catch (error) {
      console.error('Failed to update application:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !onUpdate) return;

    const notes = application.notes || [];
    const updatedNotes = [
      ...notes,
      {
        id: crypto.randomUUID(),
        text: newNote,
        date: new Date().toISOString(),
        type: 'user',
      },
    ];

    await onUpdate({ notes: updatedNotes });
    setNewNote('');
  };

  const handleTagsChange = async (tags: string[]) => {
    if (onUpdate) {
      await onUpdate({ tags });
    }
  };

  const stages = [
    { value: 'applied', label: 'Applied' },
    { value: 'screening', label: 'Screening' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer', label: 'Offer' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const getStageColor = (stage: string) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-700',
      screening: 'bg-yellow-100 text-yellow-700',
      interviewing: 'bg-purple-100 text-purple-700',
      offer: 'bg-green-100 text-green-700',
      accepted: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FileText },
    { id: 'timeline' as TabType, label: 'Timeline', icon: Clock },
    { id: 'interviews' as TabType, label: 'Interviews', icon: Calendar },
    { id: 'tags' as TabType, label: 'Tags', icon: Tag },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {application.company_logo_url ? (
              <img
                src={application.company_logo_url}
                alt={application.company_name}
                className="h-12 w-12 rounded-lg object-contain bg-gray-50 p-1"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {application.company_name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{application.job_title}</h2>
              <p className="text-sm text-gray-600">{application.company_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status & Stage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Stage</label>
                  {isEditing ? (
                    <select
                      value={editedData.stage || application.stage}
                      onChange={(e) => setEditedData({ ...editedData, stage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {stages.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getStageColor(
                        application.stage
                      )}`}
                    >
                      {application.stage.charAt(0).toUpperCase() + application.stage.slice(1)}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <p className="text-gray-900">{application.status}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {application.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{application.location}</p>
                    </div>
                  </div>
                )}

                {application.employment_type && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Employment Type</p>
                      <p className="text-gray-900">{application.employment_type}</p>
                    </div>
                  </div>
                )}

                {application.seniority_level && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Seniority Level</p>
                      <p className="text-gray-900">{application.seniority_level}</p>
                    </div>
                  </div>
                )}

                {application.salary_range && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Salary Range</p>
                      <p className="text-gray-900">{application.salary_range}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Applied Date</p>
                    <p className="text-gray-900">
                      {format(new Date(application.applied_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                      placeholder="Add a note..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {application.notes && application.notes.length > 0 ? (
                    application.notes.map((note: any) => (
                      <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-900">{note.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(note.date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No notes yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <Timeline
              appliedDate={application.applied_date}
              currentStage={application.stage}
              upcomingInterview={application.upcoming_interview}
              offerDate={application.offer_date}
              acceptanceDate={application.acceptance_date}
              rejectionDate={application.rejection_date}
              onAddNote={(stage, note) => {
                // Handle adding notes to timeline
                console.log('Add note to stage:', stage, note);
              }}
            />
          )}

          {/* Interviews Tab */}
          {activeTab === 'interviews' && (
            <InterviewScheduler
              applicationId={application.id}
              companyName={application.company_name}
              jobTitle={application.job_title}
              onSave={async (interviews) => {
                // Save interviews
                console.log('Save interviews:', interviews);
              }}
            />
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Tags</h3>
              <TagManager
                selectedTags={application.tags || []}
                onTagsChange={handleTagsChange}
                placeholder="Add tags to organize this application..."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            {activeTab === 'overview' && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedData({});
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2">
            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
