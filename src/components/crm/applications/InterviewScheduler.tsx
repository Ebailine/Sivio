'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Interview {
  id: string;
  date: string;
  time: string;
  round: string;
  type: 'phone' | 'video' | 'onsite' | 'other';
  location?: string;
  meetingLink?: string;
  interviewers?: string[];
  notes?: string;
}

interface InterviewSchedulerProps {
  applicationId: string;
  companyName: string;
  jobTitle: string;
  existingInterviews?: Interview[];
  onSave?: (interviews: Interview[]) => Promise<void>;
}

const INTERVIEW_TYPES = [
  { value: 'phone', label: 'Phone Screen', icon: Clock },
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'onsite', label: 'On-site', icon: MapPin },
  { value: 'other', label: 'Other', icon: Users },
];

export function InterviewScheduler({
  applicationId,
  companyName,
  jobTitle,
  existingInterviews = [],
  onSave,
}: InterviewSchedulerProps) {
  const [interviews, setInterviews] = useState<Interview[]>(existingInterviews);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    round: '',
    type: 'video' as Interview['type'],
    location: '',
    meetingLink: '',
    interviewers: '',
    notes: '',
  });

  const handleAddInterview = () => {
    if (!formData.date || !formData.time || !formData.round) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newInterview: Interview = {
      id: `interview-${Date.now()}`,
      date: formData.date,
      time: formData.time,
      round: formData.round,
      type: formData.type,
      location: formData.location,
      meetingLink: formData.meetingLink,
      interviewers: formData.interviewers.split(',').map((i) => i.trim()).filter(Boolean),
      notes: formData.notes,
    };

    setInterviews([...interviews, newInterview]);
    setFormData({
      date: '',
      time: '',
      round: '',
      type: 'video',
      location: '',
      meetingLink: '',
      interviewers: '',
      notes: '',
    });
    setShowForm(false);
    toast.success('Interview added!');
  };

  const handleRemoveInterview = (id: string) => {
    setInterviews(interviews.filter((i) => i.id !== id));
    toast.success('Interview removed');
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSubmitting(true);
    try {
      await onSave(interviews);
      toast.success('Interviews saved!');
    } catch (error) {
      toast.error('Failed to save interviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCalendarLink = (interview: Interview) => {
    const dateTime = new Date(`${interview.date}T${interview.time}`);
    const title = `${interview.round} - ${companyName}`;
    const description = `${jobTitle} interview at ${companyName}`;

    // Google Calendar link
    const startTime = dateTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
      description
    )}&location=${encodeURIComponent(interview.location || interview.meetingLink || '')}`;
  };

  return (
    <div className="space-y-4">
      {/* Existing Interviews */}
      {interviews.length > 0 && (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const TypeIcon = INTERVIEW_TYPES.find((t) => t.value === interview.type)?.icon || Clock;
            return (
              <div
                key={interview.id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{interview.round}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(interview.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{interview.time}</span>
                        </div>
                      </div>
                      {interview.location && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{interview.location}</span>
                        </div>
                      )}
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Video className="h-4 w-4" />
                          Join Meeting
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {interview.interviewers && interview.interviewers.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Interviewers:</span>{' '}
                          {interview.interviewers.join(', ')}
                        </div>
                      )}
                      {interview.notes && (
                        <p className="mt-2 text-sm text-gray-600 italic">{interview.notes}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveInterview(interview.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>

                {/* Calendar Links */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                  <a
                    href={generateCalendarLink(interview)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Add to Google Calendar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Interview Form */}
      {showForm ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">Schedule New Interview</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Round *
            </label>
            <input
              type="text"
              value={formData.round}
              onChange={(e) => setFormData({ ...formData, round: e.target.value })}
              placeholder="e.g., Technical Screen, Final Round"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Interview['type'] })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {INTERVIEW_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location / Address
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Office address or city"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="Zoom, Google Meet, etc."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interviewers (comma-separated)
            </label>
            <input
              type="text"
              value={formData.interviewers}
              onChange={(e) => setFormData({ ...formData, interviewers: e.target.value })}
              placeholder="John Doe, Jane Smith"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Preparation notes, topics to review, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAddInterview}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Add Interview
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({
                  date: '',
                  time: '',
                  round: '',
                  type: 'video',
                  location: '',
                  meetingLink: '',
                  interviewers: '',
                  notes: '',
                });
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
        >
          <Plus className="h-5 w-5" />
          Schedule Interview
        </button>
      )}

      {/* Save Button */}
      {onSave && interviews.length > 0 && (
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save All Interviews'}
        </button>
      )}
    </div>
  );
}
