'use client';

import { motion } from 'framer-motion';
import {
  Users,
  ArrowUpCircle,
  FileText,
  MessageSquare,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export interface Activity {
  id: string;
  type: 'contacts_found' | 'status_change' | 'application_created' | 'note_added' | 'interview_scheduled';
  description: string;
  timestamp: Date;
  applicationId?: string;
  applicationTitle?: string;
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityConfig = {
  contacts_found: {
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
  },
  status_change: {
    icon: ArrowUpCircle,
    color: 'text-green-600 bg-green-100',
  },
  application_created: {
    icon: FileText,
    color: 'text-purple-600 bg-purple-100',
  },
  note_added: {
    icon: MessageSquare,
    color: 'text-yellow-600 bg-yellow-100',
  },
  interview_scheduled: {
    icon: Calendar,
    color: 'text-indigo-600 bg-indigo-100',
  },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No recent activity</p>
          <p className="text-sm text-gray-500 mt-1">Your activity will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Link
          href="/crm/activity"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {activities.slice(0, 10).map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`${config.color} rounded-lg p-2 flex-shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {activity.description}
                  {activity.applicationTitle && activity.applicationId && (
                    <>
                      {' for '}
                      <Link
                        href={`/crm/applications/${activity.applicationId}`}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {activity.applicationTitle}
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
