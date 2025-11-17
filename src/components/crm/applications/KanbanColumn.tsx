'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';

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
  notes?: string[];
}

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  applications: Application[];
  onSelectApplication?: (application: Application) => void;
}

export function KanbanColumn({
  id,
  title,
  count,
  color,
  applications,
  onSelectApplication,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div
        ref={setNodeRef}
        className={`rounded-xl border-2 ${color} ${
          isOver ? 'border-blue-400 bg-blue-50' : ''
        } transition-colors min-h-[600px]`}
      >
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="bg-white px-2.5 py-1 rounded-full text-sm font-medium text-gray-700">
              {count}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="p-3 space-y-3">
          <SortableContext
            items={applications.map((app) => app.id)}
            strategy={verticalListSortingStrategy}
          >
            {applications.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                No applications
              </div>
            ) : (
              applications.map((application) => (
                <KanbanCard
                  key={application.id}
                  application={application}
                  onSelect={onSelectApplication}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
