# MEGA PROMPT #2: TWENTY CRM INTEGRATION (TABLE VIEW ONLY)

**Target Branch:** `phase2-crm-integration`
**Estimated Time:** 8-12 hours
**Complexity:** HIGH
**Prerequisites:** Phase 1 COMPLETE, Node 20+, npm, Understanding of Twenty CRM architecture

---

## 🎯 MISSION OBJECTIVE

You are implementing **Phase 2** of the Sivio transformation project. Your objective is to enhance Sivio's existing CRM functionality by adapting components and patterns from Twenty CRM (https://github.com/twentyhq/twenty) while maintaining Sivio's purple gradient design aesthetic.

**CRITICAL CONSTRAINTS:**
- **TABLE VIEW ONLY** - NO Kanban board implementation
- **APIFY DATA SOURCE** - NOT Snov.io (user confirmed)
- **PURPLE GRADIENT DESIGN** - Must match Sivio's existing aesthetic
- **NO BACKEND CHANGES** - Use existing Supabase schema and API routes

**Success Criteria:**
- ✅ Enhanced table view with Twenty CRM-inspired features
- ✅ All styling matches Sivio's purple gradient theme
- ✅ Contact management system improved
- ✅ Pipeline stages simplified (Saved → Applied → Interview → Offer)
- ✅ Drag-and-drop status updates in table view
- ✅ Advanced filtering and search
- ✅ Build succeeds with zero errors
- ✅ All existing functionality preserved

**What You Will NOT Do:**
- ❌ Implement Kanban board view
- ❌ Change database schema
- ❌ Integrate Snov.io
- ❌ Modify existing API routes structure
- ❌ Change color scheme from purple gradient

---

## 📚 PREREQUISITE RESEARCH

### Understanding Twenty CRM Architecture

Before starting, familiarize yourself with Twenty CRM:

**Key Technologies Twenty Uses:**
- **Backend:** NestJS, BullMQ, PostgreSQL, Redis
- **Frontend:** React, Recoil (state management), Emotion (styling)
- **Features:** Kanban views, table views, custom objects, workflow automation

**What We'll Adapt:**
1. ✅ **Table Component Structure** - Advanced filtering, sorting, grouping
2. ✅ **Contact Management UI** - Card-based contact display
3. ✅ **Search & Filter Logic** - Multi-criteria filtering
4. ✅ **Data Table Patterns** - Column customization, bulk actions
5. ❌ **Kanban Board** - EXPLICITLY EXCLUDED per user requirements
6. ❌ **Backend Architecture** - We keep Sivio's existing Supabase setup

**Quick Reference:**
```bash
# Clone Twenty for reference (optional)
cd ~/Desktop
git clone https://github.com/twentyhq/twenty
cd twenty

# Browse relevant components
# Look at: packages/twenty-front/src/modules/object-record/record-table/
# Look at: packages/twenty-front/src/modules/object-record/record-board/ (for inspiration only, not implementation)
```

**Documentation:** https://twenty.com/user-guide

---

## 📋 STEP-BY-STEP EXECUTION PLAN

### STEP 1: ANALYSIS & PLANNING (90 minutes)

#### 1.1 Audit Current CRM Implementation

**Examine Existing Files:**
```bash
cd /Users/ethanbailine/Desktop/sivio

# List current CRM components
ls -R src/components/crm/

# Expected structure:
# - applications/ (ApplicationsTable, KanbanBoard, ContactFinderButton, etc.)
# - contacts/ (Contact management components)
# - dashboard/ (Dashboard widgets)
# - analytics/ (Analytics components)
# - shared/ (Shared CRM components)
```

**Read Key Files:**
1. `src/app/crm/applications/page.tsx` - Main applications page
2. `src/components/crm/applications/ApplicationsTable.tsx` - Current table implementation
3. `src/components/crm/applications/KanbanBoard.tsx` - To be disabled/removed
4. `src/components/crm/contacts/` - Contact management components

**Document Current State:**
Create `CRM_CURRENT_STATE.md`:

```markdown
# SIVIO CRM - CURRENT STATE ANALYSIS

## Existing Features
- ✅ Applications table view
- ✅ Basic filtering (status, stage)
- ✅ Contact finder integration
- ✅ Application status tracking
- ❌ Kanban view (to be removed)
- ⚠️ Limited search functionality
- ⚠️ No bulk actions
- ⚠️ No column customization

## Current Data Model
\`\`\`typescript
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
  stage: string;  // Current stages?
  status: string;
  applied_date: string;
  created_at: string;
  updated_at?: string;
  notes?: string[];
}
\`\`\`

## Current API Endpoints
- GET /api/applications - Fetch all applications
- PATCH /api/applications/[id] - Update application
- POST /api/contacts/search - Find contacts (uses Apify)

## Current UI Components
1. ApplicationsTable - Main table component
2. ContactFinderButton - Trigger contact search
3. LoadingState - Loading indicators
4. ... (list all)

## Gaps to Address
1. Limited table functionality (no advanced filters)
2. No bulk operations
3. No drag-and-drop in table
4. Limited contact management
5. No pipeline visualization in table
```

#### 1.2 Define New Features from Twenty

**Features to Adapt:**

**Feature 1: Enhanced Table with Advanced Filters**
- Multi-column sorting
- Advanced filter builder (AND/OR conditions)
- Column visibility controls
- Bulk selection and actions
- Inline editing

**Feature 2: Improved Contact Management**
- Contact cards with relevance scoring
- Quick actions (email, LinkedIn)
- Contact notes and history
- Integration with applications

**Feature 3: Pipeline Stages (Simplified)**
- **Saved** - Job bookmarked, not applied yet
- **Applied** - Application submitted
- **Interview** - Interview scheduled
- **Offer** - Offer received

**Feature 4: Drag-and-Drop Status Updates**
- Drag application rows to change stage
- Visual feedback during drag
- Undo functionality

**Feature 5: Search & Filter Persistence**
- Save filter presets
- Quick filters (e.g., "This week", "Needs follow-up")
- Search across all fields

#### 1.3 Create Implementation Checklist

Create `CRM_IMPLEMENTATION_PLAN.md`:

```markdown
# PHASE 2: CRM INTEGRATION - IMPLEMENTATION PLAN

## PART A: Component Extraction from Twenty (3-4 hours)
- [ ] Study Twenty's table component architecture
- [ ] Extract filter logic patterns
- [ ] Adapt search functionality
- [ ] Copy column customization patterns
- [ ] Extract drag-and-drop logic (for table rows)

## PART B: Styling Adaptation (2-3 hours)
- [ ] Document Sivio's purple gradient palette
- [ ] Create design tokens for CRM components
- [ ] Rewrite Twenty's Emotion styles to Tailwind
- [ ] Ensure all components match Sivio aesthetic

## PART C: Feature Implementation (4-5 hours)
- [ ] Enhanced ApplicationsTable component
- [ ] Advanced filter system
- [ ] Bulk actions toolbar
- [ ] Drag-and-drop row reordering
- [ ] Inline editing for notes/status

## PART D: Integration & Testing (2-3 hours)
- [ ] Wire up to existing API routes
- [ ] Test with real Supabase data
- [ ] Verify Apify contact finder integration
- [ ] Manual testing of all features
- [ ] Performance optimization
```

---

### STEP 2: DESIGN SYSTEM SETUP (60 minutes)

#### 2.1 Document Sivio's Color Palette

Based on the screenshots and existing code:

```typescript
// src/lib/design/colors.ts
/**
 * Sivio Brand Colors - Purple Gradient Design System
 * Extracted from existing homepage and CRM screenshots
 */

export const sivioColors = {
  // Primary Purple Gradient
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // Main purple
    600: '#9333ea',  // Vivid purple
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Accent Blue (for gradients)
  blue: {
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',  // Main blue in gradient
  },

  // Accent Pink (for gradients)
  pink: {
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',  // Main pink in gradient
  },

  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic Colors
  success: '#10b981',  // Green
  warning: '#f59e0b',  // Orange
  error: '#ef4444',    // Red
  info: '#3b82f6',     // Blue
};

// Gradient Definitions
export const sivioGradients = {
  primary: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500',
  subtle: 'bg-gradient-to-r from-purple-50 to-pink-50',
  card: 'bg-gradient-to-br from-white to-purple-50',
  button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
};
```

#### 2.2 Create CRM Component Design Tokens

```typescript
// src/lib/design/crm-tokens.ts
/**
 * Design tokens specifically for CRM components
 * Ensures consistency across all CRM UI elements
 */

export const crmDesignTokens = {
  // Table Styles
  table: {
    headerBg: 'bg-gray-50',
    headerText: 'text-gray-700 font-semibold',
    rowBg: 'bg-white',
    rowHover: 'hover:bg-purple-50',
    rowSelected: 'bg-purple-100',
    border: 'border-gray-200',
    padding: 'px-4 py-3',
  },

  // Card Styles
  card: {
    base: 'bg-white rounded-xl border border-gray-200 shadow-sm',
    hover: 'hover:shadow-md transition-shadow',
    selected: 'ring-2 ring-purple-500',
  },

  // Stage Badges
  stages: {
    saved: 'bg-blue-100 text-blue-700',
    applied: 'bg-purple-100 text-purple-700',
    interview: 'bg-green-100 text-green-700',
    offer: 'bg-pink-100 text-pink-700',
    rejected: 'bg-gray-100 text-gray-700',
  },

  // Status Indicators
  status: {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    completed: 'bg-purple-500',
    archived: 'bg-gray-500',
  },

  // Buttons
  buttons: {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-700 hover:bg-gray-100',
  },
};
```

---

### STEP 3: ENHANCED TABLE IMPLEMENTATION (4-5 hours)

#### 3.1 Create Advanced Table Component

**File:** `src/components/crm/applications/EnhancedApplicationsTable.tsx`

```typescript
'use client';

import { useState, useMemo, useCallback } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Mail,
  ExternalLink,
  Trash2,
  Edit,
  GripVertical,
} from 'lucide-react';
import { crmDesignTokens } from '@/lib/design/crm-tokens';

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  company_logo_url?: string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  stage: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  status: string;
  applied_date: string;
  created_at: string;
  updated_at?: string;
  notes?: string[];
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
}

interface EnhancedApplicationsTableProps {
  applications: Application[];
  onSelectApplications: (ids: string[]) => void;
  selectedApplications: string[];
  onUpdateStage?: (appId: string, newStage: string) => Promise<void>;
  onDeleteApplications?: (ids: string[]) => Promise<void>;
}

export function EnhancedApplicationsTable({
  applications,
  onSelectApplications,
  selectedApplications,
  onUpdateStage,
  onDeleteApplications,
}: EnhancedApplicationsTableProps) {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>('applied_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStage, setFilterStage] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'job_title', label: 'Job Title', visible: true, sortable: true, width: 'w-1/4' },
    { id: 'company_name', label: 'Company', visible: true, sortable: true, width: 'w-1/6' },
    { id: 'location', label: 'Location', visible: true, sortable: true, width: 'w-1/6' },
    { id: 'stage', label: 'Stage', visible: true, sortable: true, width: 'w-32' },
    { id: 'applied_date', label: 'Applied', visible: true, sortable: true, width: 'w-32' },
    { id: 'salary_range', label: 'Salary', visible: true, sortable: false, width: 'w-32' },
    { id: 'actions', label: 'Actions', visible: true, sortable: false, width: 'w-24' },
  ]);

  // Filtering Logic
  const filteredApplications = useMemo(() => {
    let result = applications;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.job_title.toLowerCase().includes(query) ||
          app.company_name.toLowerCase().includes(query) ||
          app.location?.toLowerCase().includes(query)
      );
    }

    // Stage filter
    if (filterStage) {
      result = result.filter((app) => app.stage === filterStage);
    }

    return result;
  }, [applications, searchQuery, filterStage]);

  // Sorting Logic
  const sortedApplications = useMemo(() => {
    if (!sortColumn) return filteredApplications;

    return [...filteredApplications].sort((a, b) => {
      const aValue = a[sortColumn as keyof Application];
      const bValue = b[sortColumn as keyof Application];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredApplications, sortColumn, sortDirection]);

  // Drag and Drop Handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Implement stage update logic
    // This is a simplified version - enhance based on your needs
    console.log('Drag ended:', active.id, 'to', over.id);
  };

  // Column Sort Handler
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Bulk Selection
  const toggleAllSelection = () => {
    if (selectedApplications.length === sortedApplications.length) {
      onSelectApplications([]);
    } else {
      onSelectApplications(sortedApplications.map((app) => app.id));
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedApplications.includes(id)) {
      onSelectApplications(selectedApplications.filter((appId) => appId !== id));
    } else {
      onSelectApplications([...selectedApplications, id]);
    }
  };

  // Stage Badge Component
  const StageBadge = ({ stage }: { stage: Application['stage'] }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${crmDesignTokens.stages[stage]}`}>
      {stage.charAt(0).toUpperCase() + stage.slice(1)}
    </span>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header with Search and Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={filterStage || ''}
            onChange={(e) => setFilterStage(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Stages</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Bulk Actions (show when items selected) */}
          {selectedApplications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedApplications.length} selected</span>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedApplications.length} applications?`)) {
                    onDeleteApplications?.(selectedApplications);
                  }
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className={crmDesignTokens.table.headerBg}>
            <tr>
              {/* Checkbox Column */}
              <th className={`${crmDesignTokens.table.padding} w-12`}>
                <input
                  type="checkbox"
                  checked={selectedApplications.length === sortedApplications.length && sortedApplications.length > 0}
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>

              {/* Drag Handle Column */}
              <th className="w-12"></th>

              {/* Data Columns */}
              {columns
                .filter((col) => col.visible)
                .map((column) => (
                  <th
                    key={column.id}
                    className={`${crmDesignTokens.table.headerText} ${crmDesignTokens.table.padding} text-left ${column.width}`}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.id)}
                        className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                      >
                        {column.label}
                        {sortColumn === column.id && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {sortedApplications.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-gray-500">
                  {searchQuery || filterStage ? 'No applications match your filters' : 'No applications yet'}
                </td>
              </tr>
            ) : (
              sortedApplications.map((app) => (
                <ApplicationRow
                  key={app.id}
                  application={app}
                  isSelected={selectedApplications.includes(app.id)}
                  onToggleSelection={toggleSelection}
                  onUpdateStage={onUpdateStage}
                  columns={columns}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        Showing {sortedApplications.length} of {applications.length} applications
      </div>
    </div>
  );
}

// Separate Row Component for Better Performance
interface ApplicationRowProps {
  application: Application;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onUpdateStage?: (appId: string, newStage: string) => Promise<void>;
  columns: Column[];
}

function ApplicationRow({
  application,
  isSelected,
  onToggleSelection,
  onUpdateStage,
  columns,
}: ApplicationRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${crmDesignTokens.table.rowBg} ${crmDesignTokens.table.rowHover} ${
        isSelected ? crmDesignTokens.table.rowSelected : ''
      } transition-colors`}
    >
      {/* Checkbox */}
      <td className={crmDesignTokens.table.padding}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(application.id)}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      </td>

      {/* Drag Handle */}
      <td className="px-2">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical className="h-5 w-5" />
        </button>
      </td>

      {/* Job Title */}
      {columns.find((c) => c.id === 'job_title')?.visible && (
        <td className={`${crmDesignTokens.table.padding} font-medium text-gray-900`}>
          {application.job_title}
        </td>
      )}

      {/* Company */}
      {columns.find((c) => c.id === 'company_name')?.visible && (
        <td className={crmDesignTokens.table.padding}>
          <div className="flex items-center gap-2">
            {application.company_logo_url && (
              <img src={application.company_logo_url} alt="" className="w-6 h-6 rounded" />
            )}
            <span className="text-gray-900">{application.company_name}</span>
          </div>
        </td>
      )}

      {/* Location */}
      {columns.find((c) => c.id === 'location')?.visible && (
        <td className={`${crmDesignTokens.table.padding} text-gray-600`}>{application.location || 'Remote'}</td>
      )}

      {/* Stage */}
      {columns.find((c) => c.id === 'stage')?.visible && (
        <td className={crmDesignTokens.table.padding}>
          <select
            value={application.stage}
            onChange={(e) => onUpdateStage?.(application.id, e.target.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-purple-500 ${
              crmDesignTokens.stages[application.stage]
            }`}
          >
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </td>
      )}

      {/* Applied Date */}
      {columns.find((c) => c.id === 'applied_date')?.visible && (
        <td className={`${crmDesignTokens.table.padding} text-gray-600 text-sm`}>
          {new Date(application.applied_date).toLocaleDateString()}
        </td>
      )}

      {/* Salary */}
      {columns.find((c) => c.id === 'salary_range')?.visible && (
        <td className={`${crmDesignTokens.table.padding} text-gray-600 text-sm`}>
          {application.salary_range || 'N/A'}
        </td>
      )}

      {/* Actions */}
      {columns.find((c) => c.id === 'actions')?.visible && (
        <td className={crmDesignTokens.table.padding}>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 rounded" title="View details">
              <ExternalLink className="h-4 w-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded" title="Edit notes">
              <Edit className="h-4 w-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded" title="More actions">
              <MoreHorizontal className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
```

#### 3.2 Update Applications Page to Use Enhanced Table

**File:** `src/app/crm/applications/page.tsx`

**Changes:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import MainNav from '@/components/MainNav';
import { LoadingDashboard } from '@/components/crm/shared/LoadingState';
import { EnhancedApplicationsTable } from '@/components/crm/applications/EnhancedApplicationsTable';  // CHANGED
import { ContactFinderButton } from '@/components/crm/applications/ContactFinderButton';
import { Briefcase, AlertCircle } from 'lucide-react';

// REMOVE: import { ApplicationsTable } from ...
// REMOVE: import { KanbanBoard } from ...
// REMOVE: All Kanban-related code

interface Application {
  // ... (keep existing interface)
}

export default function ApplicationsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // REMOVE: const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchApplications();
  }, [isLoaded, isSignedIn, router]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/applications');

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactFinderComplete = () => {
    setSelectedApplications([]);
  };

  const handleUpdateStage = async (applicationId: string, newStage: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application stage');
      }

      // Refresh applications after update
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application stage:', error);
      throw error;
    }
  };

  const handleDeleteApplications = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/applications/${id}`, {
            method: 'DELETE',
          })
        )
      );

      await fetchApplications();
      setSelectedApplications([]);
    } catch (error) {
      console.error('Error deleting applications:', error);
      alert('Failed to delete some applications');
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
                <p className="text-sm text-gray-600">
                  Manage your job applications and find hiring contacts
                </p>
              </div>
            </div>

            {/* REMOVE: View Toggle - NO KANBAN VIEW */}

            <ContactFinderButton
              selectedApplicationIds={selectedApplications}
              onComplete={handleContactFinderComplete}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading applications</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchApplications}
                  className="text-sm text-red-800 font-medium mt-2 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <LoadingDashboard />
          </div>
        )}

        {/* Applications Table - ONLY TABLE VIEW */}
        {!isLoading && !error && (
          <EnhancedApplicationsTable
            applications={applications}
            onSelectApplications={setSelectedApplications}
            selectedApplications={selectedApplications}
            onUpdateStage={handleUpdateStage}
            onDeleteApplications={handleDeleteApplications}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && applications.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h2>
            <p className="text-gray-600 mb-6">
              Start by finding jobs and marking them as applied
            </p>
            <button
              onClick={() => router.push('/jobs')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### STEP 4: IMPROVED CONTACT MANAGEMENT (2-3 hours)

#### 4.1 Enhanced Contact Card Component

**File:** `src/components/crm/contacts/EnhancedContactCard.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Mail, Linkedin, ExternalLink, Copy, Check, Star, MessageSquare } from 'lucide-react';
import { crmDesignTokens } from '@/lib/design/crm-tokens';

interface Contact {
  id?: string;
  name: string;
  title: string;
  email?: string;
  linkedin_url?: string;
  phone?: string;
  relevance_score?: number;
  department?: string;
  seniority?: string;
  notes?: string;
}

interface EnhancedContactCardProps {
  contact: Contact;
  onAddNote?: (note: string) => void;
  onEmailClick?: () => void;
}

export function EnhancedContactCard({ contact, onAddNote, onEmailClick }: EnhancedContactCardProps) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');

  const copyEmail = async () => {
    if (!contact.email) return;

    try {
      await navigator.clipboard.writeText(contact.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const getRelevanceColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getRelevanceLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 80) return 'Highly Relevant';
    if (score >= 60) return 'Relevant';
    return 'Potentially Relevant';
  };

  return (
    <div className={`${crmDesignTokens.card.base} ${crmDesignTokens.card.hover} p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{contact.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{contact.title}</p>
          {contact.department && (
            <p className="text-xs text-gray-500 mt-0.5">{contact.department}</p>
          )}
        </div>

        {/* Relevance Score */}
        {contact.relevance_score !== undefined && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <Star className={`h-4 w-4 ${getRelevanceColor(contact.relevance_score)} fill-current`} />
              <span className={`font-medium ${getRelevanceColor(contact.relevance_score)}`}>
                {contact.relevance_score}
              </span>
            </div>
            <span className={`text-xs ${getRelevanceColor(contact.relevance_score)}`}>
              {getRelevanceLabel(contact.relevance_score)}
            </span>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        {contact.email && (
          <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{contact.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={copyEmail}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Copy email"
              >
                {emailCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600" />
                )}
              </button>
              <button
                onClick={onEmailClick}
                className="p-1.5 hover:bg-purple-100 rounded transition-colors"
                title="Send email"
              >
                <Mail className="h-4 w-4 text-purple-600" />
              </button>
            </div>
          </div>
        )}

        {contact.linkedin_url && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <Linkedin className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <a
              href={contact.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-700 hover:underline flex items-center gap-1 flex-1 min-w-0"
            >
              <span className="truncate">View LinkedIn Profile</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          {showNotes ? 'Hide Notes' : 'Add Note'}
        </button>

        {showNotes && (
          <div className="mt-2 space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note about this contact..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button
              onClick={() => {
                if (noteText.trim()) {
                  onAddNote?.(noteText);
                  setNoteText('');
                  setShowNotes(false);
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Note
            </button>
          </div>
        )}

        {contact.notes && (
          <div className="mt-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
            {contact.notes}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### STEP 5: TESTING & VERIFICATION (2-3 hours)

#### 5.1 Build and Type Check

```bash
# Clean build
rm -rf .next

# Type check
npm run typecheck
# Expected: 0 errors

# Build
npm run build
# Expected: Success

# Start dev server
npm run dev
```

#### 5.2 Manual Testing Checklist

**Enhanced Applications Table:**
- [ ] Table loads with all applications
- [ ] Search filters applications correctly
- [ ] Stage filter works
- [ ] Column sorting works (ascending/descending)
- [ ] Bulk selection works (select all, select individual)
- [ ] Bulk delete works
- [ ] Drag handle visible on each row
- [ ] Stage dropdown updates application
- [ ] Action buttons work (view, edit, more)
- [ ] Empty state shows when no applications
- [ ] Purple gradient theme consistent

**Contact Cards:**
- [ ] Contact information displays correctly
- [ ] Relevance score shows with correct color
- [ ] Email copy button works
- [ ] LinkedIn link opens in new tab
- [ ] Notes section toggles open/close
- [ ] Can add notes to contacts
- [ ] Purple accents match Sivio theme

**Integration:**
- [ ] Contact Finder button still works
- [ ] Applications fetch from API correctly
- [ ] Stage updates persist to database
- [ ] Deleted applications removed from DB
- [ ] Auth protection works
- [ ] Navigation still functional

#### 5.3 Performance Testing

```bash
# Check bundle size
npm run build
# Look for warnings about large chunks

# Test with large dataset
# Add 100+ test applications to database
# Verify table still performs well
```

#### 5.4 Create Test Report

**File:** `PHASE2_CRM_TESTING_REPORT.md`

```markdown
# PHASE 2: CRM INTEGRATION - TESTING REPORT

**Date:** [Current Date]
**Branch:** phase2-crm-integration
**Tester:** Claude Code

---

## EXECUTIVE SUMMARY
✅ Enhanced table view implemented
✅ Twenty CRM patterns successfully adapted
✅ Purple gradient theme maintained
✅ All functionality working
✅ Build succeeds with zero errors
✅ Ready for Phase 3 (Content Overhaul)

---

## FEATURES IMPLEMENTED

### Enhanced Applications Table
- ✅ Advanced search across all fields
- ✅ Multi-column sorting
- ✅ Stage filtering
- ✅ Bulk selection and actions
- ✅ Drag-and-drop row reordering (visual only)
- ✅ Inline stage editing
- ✅ Quick action buttons
- ✅ Column customization (prepared for future)

### Contact Management
- ✅ Enhanced contact cards
- ✅ Relevance score display
- ✅ One-click email copy
- ✅ LinkedIn integration
- ✅ Notes functionality
- ✅ Smart color coding

### Design Consistency
- ✅ Purple gradient theme maintained
- ✅ Design tokens system created
- ✅ All components match Sivio aesthetic
- ✅ Responsive on mobile, tablet, desktop

---

## TESTING RESULTS

### Build Status
- **TypeScript Errors:** 0 ✅
- **Build Time:** Xs
- **Bundle Size:** X MB
- **No Warnings:** ✅

### Feature Testing
| Feature | Status | Notes |
|---------|--------|-------|
| Table search | ✅ PASS | Searches all fields correctly |
| Stage filter | ✅ PASS | Filters by stage correctly |
| Column sorting | ✅ PASS | All sortable columns work |
| Bulk selection | ✅ PASS | Select all/individual works |
| Bulk delete | ✅ PASS | Deletes multiple applications |
| Drag handles | ✅ PASS | Visual feedback present |
| Stage dropdown | ✅ PASS | Updates persist to DB |
| Contact cards | ✅ PASS | All info displays correctly |
| Email copy | ✅ PASS | Clipboard API works |
| Notes | ✅ PASS | Can add/view notes |

---

## COMPONENTS CREATED
1. `EnhancedApplicationsTable.tsx` - Advanced table with all features
2. `EnhancedContactCard.tsx` - Improved contact display
3. `colors.ts` - Sivio color palette
4. `crm-tokens.ts` - CRM design tokens

---

## COMPONENTS REMOVED/DISABLED
- ❌ `KanbanBoard.tsx` - Removed from page (file can be deleted)
- ❌ View toggle UI - Removed (table only)

---

## DATABASE CHANGES
- No schema changes required ✅
- Existing API routes work perfectly ✅

---

## PERFORMANCE METRICS
- Initial load time: Xms
- Search response time: Xms
- Table rendering (100 rows): Xms
- Memory usage: X MB

---

## KNOWN LIMITATIONS
1. Drag-and-drop currently visual only (not reordering)
2. Column customization UI not yet implemented (prepared for future)
3. No undo functionality for bulk deletes (add confirmation instead)

---

## NEXT STEPS
✅ Phase 2 COMPLETE - Ready for Phase 3: Content Overhaul
```

---

### STEP 6: COMMIT AND DEPLOY (30 minutes)

```bash
# Review changes
git status
git diff

# Stage all changes
git add .

# Commit with detailed message
git commit -m "feat: Implement Phase 2 - Twenty CRM integration (table view)

IMPLEMENTED:
- Enhanced applications table with advanced features
- Multi-criteria search and filtering
- Column sorting (all sortable fields)
- Bulk selection and deletion
- Drag-and-drop row handles (visual feedback)
- Inline stage editing
- Improved contact cards with relevance scoring
- Notes functionality for contacts
- Email copy and LinkedIn integration

DESIGN:
- Created Sivio color palette system
- Created CRM design tokens
- All components match purple gradient theme
- Consistent styling across all CRM components

REMOVED:
- Kanban view toggle from applications page
- Kanban board component usage (file remains for reference)

TECHNICAL:
- Zero TypeScript errors
- Zero ESLint errors
- Build succeeds
- All tests passing
- Performance optimized for 100+ applications

ADAPTED FROM TWENTY CRM:
- Table component patterns
- Filter logic architecture
- Contact card design patterns
- Bulk action patterns

Completes Phase 2 of Sivio transformation project.
Ready for Phase 3: Content Overhaul.
"

# Push to GitHub
git push origin phase2-crm-integration

# Monitor Vercel deployment
# Wait for deploy to complete
sleep 180

# Test live site
curl https://sivio.vercel.app/crm/applications | grep "Applications"
```

---

## 🚨 ROLLBACK PROCEDURE

If something breaks:

```bash
# Stop dev server
pkill -f "next dev"

# Restore from Phase 1
git log --oneline | grep "Phase 1"
# Note the commit hash

git reset --hard [phase-1-commit-hash]

# Or restore from backup branch
git checkout backup-before-phase1-fixes

# Document what broke
echo "Document issues in PHASE2_ROLLBACK_NOTES.md"
```

---

## 📊 SUCCESS METRICS

✅ **Build Success**
```bash
npm run build  # Exit code: 0
```

✅ **Enhanced Features Working**
- Search functionality ✅
- Filtering by stage ✅
- Column sorting ✅
- Bulk actions ✅
- Contact cards with notes ✅
- Email copy ✅
- LinkedIn links ✅

✅ **Design Consistency**
- Purple gradient theme maintained ✅
- All components styled consistently ✅
- Mobile responsive ✅

✅ **No Regressions**
- All Phase 1 fixes still working ✅
- Database connections intact ✅
- Auth flow working ✅
- All pages load correctly ✅

---

## ✅ COMPLETION CHECKLIST

Before marking Phase 2 complete:

- [ ] Enhanced table implemented with all features
- [ ] Contact cards improved
- [ ] Purple gradient theme consistent throughout
- [ ] NO Kanban view visible or accessible
- [ ] Search, filter, sort all working
- [ ] Bulk actions functional
- [ ] `npm run build` succeeds
- [ ] `npm run typecheck` passes
- [ ] Manual testing complete
- [ ] PHASE2_CRM_TESTING_REPORT.md created
- [ ] All changes committed
- [ ] Pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Live site tested

---

## 🎉 WHEN PHASE 2 IS COMPLETE

Report to user:

```
PHASE 2: CRM INTEGRATION - COMPLETE ✅

Summary:
- Enhanced table view with Twenty CRM patterns
- Advanced search, filter, sort capabilities
- Improved contact management
- Purple gradient theme maintained throughout
- Build succeeds, all tests passing

Key Features:
- Multi-criteria search
- Bulk selection and actions
- Inline editing
- Enhanced contact cards
- Notes functionality

Next Step: Proceed to MEGA_PROMPT_3_Content_Overhaul.md
```

---

**END OF MEGA PROMPT #2**
