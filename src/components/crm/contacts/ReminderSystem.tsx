'use client';

import { useState } from 'react';
import { format, addDays, isPast, isToday, isTomorrow } from 'date-fns';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Reminder {
  id: string;
  contactId: string;
  contactName: string;
  date: string;
  time?: string;
  title: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

interface ReminderSystemProps {
  contactId?: string;
  contactName?: string;
  existingReminders?: Reminder[];
  onSave?: (reminders: Reminder[]) => Promise<void>;
  showAll?: boolean;
}

export function ReminderSystem({
  contactId,
  contactName,
  existingReminders = [],
  onSave,
  showAll = false,
}: ReminderSystemProps) {
  const [reminders, setReminders] = useState<Reminder[]>(existingReminders);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    notes: '',
  });

  const handleAddReminder = () => {
    if (!formData.title || !formData.date) {
      toast.error('Please enter a title and date');
      return;
    }

    if (!contactId || !contactName) {
      toast.error('Contact information missing');
      return;
    }

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      contactId,
      contactName,
      date: formData.date,
      time: formData.time,
      title: formData.title,
      notes: formData.notes,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setReminders([...reminders, newReminder]);
    setFormData({ title: '', date: '', time: '', notes: '' });
    setShowForm(false);
    toast.success('Reminder added!');
  };

  const handleToggleComplete = (id: string) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    );
    const reminder = reminders.find((r) => r.id === id);
    toast.success(
      reminder?.completed ? 'Reminder marked incomplete' : 'Reminder completed!'
    );
  };

  const handleDelete = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
    toast.success('Reminder deleted');
  };

  const handleSnooze = (id: string, days: number) => {
    setReminders(
      reminders.map((r) => {
        if (r.id === id) {
          const newDate = addDays(new Date(r.date), days);
          return { ...r, date: format(newDate, 'yyyy-MM-dd') };
        }
        return r;
      })
    );
    toast.success(`Snoozed for ${days} day${days !== 1 ? 's' : ''}`);
  };

  const handleSave = async () => {
    if (!onSave) return;

    try {
      await onSave(reminders);
      toast.success('Reminders saved!');
    } catch (error) {
      toast.error('Failed to save reminders');
    }
  };

  const getReminderStatus = (reminder: Reminder) => {
    if (reminder.completed) return 'completed';
    const reminderDate = new Date(reminder.date);
    if (isPast(reminderDate) && !isToday(reminderDate)) return 'overdue';
    if (isToday(reminderDate)) return 'today';
    if (isTomorrow(reminderDate)) return 'tomorrow';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'today':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'tomorrow':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const upcomingCount = reminders.filter(
    (r) => !r.completed && !isPast(new Date(r.date))
  ).length;

  const overdueCount = reminders.filter(
    (r) => !r.completed && isPast(new Date(r.date)) && !isToday(new Date(r.date))
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {showAll && (
        <div className="flex gap-2">
          <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-orange-600">Overdue</p>
                <p className="text-lg font-bold text-orange-900">{overdueCount}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">Upcoming</p>
                <p className="text-lg font-bold text-blue-900">{upcomingCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {sortedReminders.length > 0 && (
        <div className="space-y-2">
          {sortedReminders.map((reminder) => {
            const status = getReminderStatus(reminder);
            const statusColor = getStatusColor(status);

            return (
              <div
                key={reminder.id}
                className={`bg-white rounded-lg border p-3 ${
                  reminder.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(reminder.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {reminder.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors"></div>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4
                        className={`font-medium text-gray-900 ${
                          reminder.completed ? 'line-through' : ''
                        }`}
                      >
                        {reminder.title}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}
                      >
                        {status === 'completed' && 'Done'}
                        {status === 'overdue' && 'Overdue'}
                        {status === 'today' && 'Today'}
                        {status === 'tomorrow' && 'Tomorrow'}
                        {status === 'upcoming' && 'Upcoming'}
                      </span>
                    </div>

                    {showAll && (
                      <p className="text-sm text-gray-600 mb-2">{reminder.contactName}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(reminder.date), 'MMM d, yyyy')}</span>
                      </div>
                      {reminder.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{reminder.time}</span>
                        </div>
                      )}
                    </div>

                    {reminder.notes && (
                      <p className="text-sm text-gray-600 mt-2">{reminder.notes}</p>
                    )}

                    {/* Actions */}
                    {!reminder.completed && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleSnooze(reminder.id, 1)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          Snooze 1 day
                        </button>
                        <button
                          onClick={() => handleSnooze(reminder.id, 7)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          Snooze 1 week
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {reminder.completed && (
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="text-xs text-red-600 hover:underline mt-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form */}
      {showForm ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">New Reminder</h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What to do? *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Follow up with contact"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
                Time (optional)
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
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional context..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleAddReminder}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Add Reminder
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
        >
          <Plus className="h-5 w-5" />
          Add Reminder
        </button>
      )}

      {/* Save Button */}
      {onSave && reminders.length > 0 && (
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Reminders
        </button>
      )}
    </div>
  );
}
