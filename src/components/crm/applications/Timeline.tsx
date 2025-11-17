'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Plus,
  X,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  stage: string;
  label: string;
  date?: string;
  status: 'completed' | 'current' | 'upcoming';
  notes?: string;
}

interface TimelineProps {
  appliedDate: string;
  currentStage: string;
  upcomingInterview?: string;
  offerDate?: string;
  acceptanceDate?: string;
  rejectionDate?: string;
  onAddNote?: (stage: string, note: string) => void;
}

const STAGE_ORDER = ['applied', 'screening', 'interviewing', 'offer', 'accepted', 'rejected'];

export function Timeline({
  appliedDate,
  currentStage,
  upcomingInterview,
  offerDate,
  acceptanceDate,
  rejectionDate,
  onAddNote,
}: TimelineProps) {
  const [showNoteInput, setShowNoteInput] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const getEventStatus = (stage: string): 'completed' | 'current' | 'upcoming' => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const stageIndex = STAGE_ORDER.indexOf(stage);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const events: TimelineEvent[] = [
    {
      id: 'applied',
      stage: 'applied',
      label: 'Application Submitted',
      date: appliedDate,
      status: getEventStatus('applied'),
    },
    {
      id: 'screening',
      stage: 'screening',
      label: 'Resume Screening',
      date: currentStage === 'screening' || STAGE_ORDER.indexOf(currentStage) > STAGE_ORDER.indexOf('screening') ? appliedDate : undefined,
      status: getEventStatus('screening'),
    },
    {
      id: 'interviewing',
      stage: 'interviewing',
      label: 'Interview Stage',
      date: upcomingInterview,
      status: getEventStatus('interviewing'),
    },
    {
      id: 'offer',
      stage: 'offer',
      label: 'Offer Received',
      date: offerDate,
      status: getEventStatus('offer'),
    },
  ];

  // Add acceptance or rejection at the end
  if (currentStage === 'accepted') {
    events.push({
      id: 'accepted',
      stage: 'accepted',
      label: 'Offer Accepted',
      date: acceptanceDate,
      status: 'completed',
    });
  } else if (currentStage === 'rejected') {
    events.push({
      id: 'rejected',
      stage: 'rejected',
      label: 'Application Rejected',
      date: rejectionDate,
      status: 'completed',
    });
  }

  const handleAddNote = (stage: string) => {
    if (noteText.trim() && onAddNote) {
      onAddNote(stage, noteText.trim());
      setNoteText('');
      setShowNoteInput(null);
    }
  };

  return (
    <div className="space-y-1">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const Icon = event.status === 'completed' ? CheckCircle2 : event.status === 'current' ? Clock : Circle;
        const iconColor =
          event.status === 'completed' ? 'text-green-600 bg-green-100' :
          event.status === 'current' ? 'text-blue-600 bg-blue-100' :
          'text-gray-400 bg-gray-100';

        return (
          <div key={event.id} className="relative">
            {/* Timeline Item */}
            <div className="flex gap-4">
              {/* Icon Column */}
              <div className="relative flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[3rem] ${
                    event.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 pb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.label}</h4>
                      {event.date && (
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(event.date), 'MMM d, yyyy \'at\' h:mm a')}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      event.status === 'completed' ? 'bg-green-100 text-green-700' :
                      event.status === 'current' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {event.status === 'completed' ? 'Completed' :
                       event.status === 'current' ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>

                  {/* Notes Section */}
                  {event.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>{event.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Add Note */}
                  {onAddNote && event.status !== 'upcoming' && (
                    <div className="mt-3">
                      {showNoteInput === event.stage ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddNote(event.stage);
                              if (e.key === 'Escape') {
                                setShowNoteInput(null);
                                setNoteText('');
                              }
                            }}
                            placeholder="Add a note..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddNote(event.stage)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowNoteInput(null);
                              setNoteText('');
                            }}
                            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNoteInput(event.stage)}
                          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="h-4 w-4" />
                          Add note
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
