'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import {
  Building2,
  MapPin,
  Calendar,
  GripVertical,
  ExternalLink,
} from 'lucide-react';

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

interface KanbanCardProps {
  application: Application;
  isDragging?: boolean;
  onSelect?: (application: Application) => void;
}

export function KanbanCard({
  application,
  isDragging = false,
  onSelect,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group ${
        isDragging ? 'shadow-xl' : ''
      }`}
      onClick={() => onSelect?.(application)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          {application.company_logo_url ? (
            <img
              src={application.company_logo_url}
              alt={application.company_name}
              className="h-8 w-8 rounded object-contain bg-gray-50 p-1"
            />
          ) : (
            <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
              {application.company_name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {application.company_name}
            </p>
          </div>
        </div>
        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Job Title */}
      <h4 className="text-sm font-medium text-gray-700 mb-3 line-clamp-2">
        {application.job_title}
      </h4>

      {/* Details */}
      <div className="space-y-2 text-xs text-gray-600">
        {application.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{application.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Applied {format(new Date(application.applied_date), 'MMM d')}</span>
        </div>
        {application.employment_type && (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
            {application.employment_type}
          </div>
        )}
      </div>

      {/* View Details Link */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(application);
          }}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View Details
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
