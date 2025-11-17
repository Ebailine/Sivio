'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { format } from 'date-fns';
import {
  Building2,
  MapPin,
  Calendar,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import toast from 'react-hot-toast';

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

interface KanbanBoardProps {
  applications: Application[];
  onUpdateStage: (applicationId: string, newStage: string) => Promise<void>;
  onSelectApplication?: (application: Application) => void;
}

const STAGES = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-100 border-blue-200' },
  { id: 'screening', label: 'Screening', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'interviewing', label: 'Interviewing', color: 'bg-purple-100 border-purple-200' },
  { id: 'offer', label: 'Offer', color: 'bg-green-100 border-green-200' },
  { id: 'accepted', label: 'Accepted', color: 'bg-emerald-100 border-emerald-200' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 border-red-200' },
];

export function KanbanBoard({
  applications,
  onUpdateStage,
  onSelectApplication,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDragging(false);

    if (!over) return;

    const applicationId = active.id as string;
    const newStage = over.id as string;

    const application = applications.find((app) => app.id === applicationId);
    if (!application) return;

    // Check if stage actually changed
    if (application.stage === newStage) return;

    // Optimistically update UI
    const oldStage = application.stage;

    try {
      await onUpdateStage(applicationId, newStage);
      toast.success(`Moved to ${STAGES.find(s => s.id === newStage)?.label}`);
    } catch (error) {
      console.error('Failed to update stage:', error);
      toast.error('Failed to update stage');
      // Revert would happen through parent component refetch
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setIsDragging(false);
  };

  const activeApplication = activeId
    ? applications.find((app) => app.id === activeId)
    : null;

  const getApplicationsByStage = (stage: string) => {
    return applications.filter((app) => app.stage === stage);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {STAGES.map((stage) => {
          const stageApplications = getApplicationsByStage(stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              title={stage.label}
              count={stageApplications.length}
              color={stage.color}
              applications={stageApplications}
              onSelectApplication={onSelectApplication}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <div className="w-80 opacity-90">
            <KanbanCard
              application={activeApplication}
              isDragging={true}
              onSelect={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
