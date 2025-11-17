# MEGA PROMPT 2: Applications Table View

## 🎯 Objective

Replace the Kanban board with a professional, sortable, filterable table view for job applications. Include inline actions (edit, delete, find contacts) and implement a quick-view drawer for application details.

---

## 📋 Prerequisites

Before starting this prompt, you must have completed:
- ✅ **MEGA PROMPT 1** (CRM Layout & Navigation)

You should have:
- Working CRM layout with sidebar
- Page header and breadcrumbs
- `/crm/applications` route placeholder

---

## 🎨 Design Vision

### Table Design:
- **Clean, minimal table** with alternating row colors
- **Sortable columns** with arrow indicators
- **Hover effects** on rows
- **Inline actions** (edit, delete, find contacts) appear on hover
- **Status badges** with color coding
- **Empty state** with CTA to add first application

### Columns:
1. **Checkbox** - Select for bulk actions
2. **Company** - Company name + logo (if available)
3. **Position** - Job title
4. **Location** - City, State/Country
5. **Status** - Badge (Applied, Screening, Interviewing, etc.)
6. **Stage** - Current stage in process
7. **Date Applied** - Relative time (e.g., "2 days ago")
8. **Contacts** - Count of found contacts + badge
9. **Actions** - Dropdown menu (View, Edit, Find Contacts, Delete)

---

## 💻 Implementation

### 1. Create Applications Table Component

**File**: `src/components/crm/applications/ApplicationsTable.tsx`

This will be a comprehensive data table with:
- Column headers with sort indicators
- Row hover states
- Inline action buttons
- Empty state
- Loading skeleton
- Pagination

**Key Features**:
```typescript
- Sort by: Date, Company, Status, Contacts Count
- Filter by: Status, Stage, Date Range, Has Contacts
- Search: Company name, position title, location
- Bulk select with actions
- Responsive (stacked on mobile)
```

---

### 2. Create Status Badge Component

**File**: `src/components/crm/applications/StatusBadge.tsx`

Color-coded badges for application status:
```typescript
const statusColors = {
  applied: 'bg-purple-100 text-purple-800',
  screening: 'bg-yellow-100 text-yellow-800',
  interviewing: 'bg-blue-100 text-blue-800',
  offer: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};
```

---

### 3. Create Find Contacts Button

**File**: `src/components/crm/applications/FindContactsButton.tsx`

Smart button that:
- Shows loading state when finding contacts
- Displays progress (Finding → Analyzing → Complete)
- Shows contact count after completion
- Handles errors gracefully

---

### 4. Create Application Drawer

**File**: `src/components/crm/applications/ApplicationDrawer.tsx`

Quick-view drawer that slides in from right with:
- Application details (company, position, location, dates)
- Status and stage
- Notes section
- Found contacts preview
- Timeline of events
- Quick actions (edit, delete, find more contacts)

---

### 5. Update Applications Page

**File**: `src/app/crm/applications/page.tsx`

Server component that:
- Fetches applications from Supabase
- Passes data to client components
- Implements search params for filters
- Handles pagination

---

### 6. Create Supabase Queries

**File**: `src/lib/supabase/queries/applications.ts`

```typescript
export async function getApplications(userId: string, filters?: {
  status?: string;
  stage?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  // Fetch applications with contact counts
  // Join with contacts table to get count
  // Apply filters and sorting
  // Return paginated results
}

export async function getApplicationById(applicationId: string) {
  // Fetch single application with all details
  // Include contact count and recent contacts
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  // Update application status
  // Create timeline event
}

export async function deleteApplication(applicationId: string) {
  // Soft delete or hard delete
}
```

---

## 📝 Detailed Component Specs

### ApplicationsTable Component

```typescript
interface ApplicationsTableProps {
  applications: Application[];
  isLoading?: boolean;
  onSort: (column: string) => void;
  onFilter: (filters: FilterState) => void;
  onSearch: (query: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

Features to implement:
1. Column Headers
   - Sortable columns show sort arrow
   - Click to toggle sort direction
   - Clear visual feedback

2. Row States
   - Default: white background
   - Hover: light gray background
   - Selected: blue tint background
   - Clickable: cursor pointer

3. Inline Actions
   - Hidden by default
   - Show on row hover
   - Dropdown menu with:
     * View Details
     * Edit Application
     * Find Contacts
     * Delete

4. Bulk Actions
   - Checkbox in header selects all
   - Selected count shown
   - Bulk actions bar appears:
     * Change Status
     * Delete Selected
     * Find Contacts (batch)

5. Empty State
   - Centered icon + message
   - CTA button "Add Your First Application"
   - Or "No applications match your filters"

6. Loading State
   - Skeleton rows (shimmer effect)
   - 10 skeleton rows shown

7. Pagination
   - Show 20 per page
   - "Load More" button
   - Or traditional pagination

8. Filters Panel
   - Collapsible filter sidebar
   - Status checkboxes
   - Stage checkboxes
   - Date range picker
   - "Has Contacts" toggle
   - Apply/Clear buttons
```

### FindContactsButton Component

```typescript
interface FindContactsButtonProps {
  applicationId: string;
  contactsCount: number;
  onContactsFound: (count: number) => void;
}

States:
1. Initial State
   - If contactsCount > 0: "Find More Contacts ({contactsCount})"
   - If contactsCount === 0: "Find Contacts"
   - Blue button

2. Loading State
   - Shows spinner
   - Text: "Finding Contacts..."
   - Disabled, grayed out

3. Progress State (optional)
   - "Scraping LinkedIn..."
   - "Analyzing with AI..."
   - "Ranking Contacts..."

4. Success State
   - Green checkmark
   - "Found {newCount} Contacts!"
   - Transition back to initial after 3s

5. Error State
   - Red error icon
   - "Failed - Try Again"
   - Click to retry
```

### ApplicationDrawer Component

```typescript
interface ApplicationDrawerProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Application) => void;
}

Layout:
┌─────────────────────────────────────┐
│ [X] Close                           │
│                                     │
│ Company Logo + Name                 │
│ Position Title                      │
│ Location                            │
│                                     │
│ Status Badge | Stage Badge          │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Details Section:                    │
│ - Date Applied                      │
│ - Salary Range                      │
│ - Job Type                          │
│ - URL (clickable)                   │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Contacts ({count})                  │
│ [Top 3 contact cards]               │
│ → View All Contacts                 │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Notes:                              │
│ [Text area]                         │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Timeline:                           │
│ • Application created - 3 days ago  │
│ • Status changed - 2 days ago       │
│ • Contacts found (5) - 1 day ago    │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Actions:                            │
│ [Find More Contacts]                │
│ [Edit]  [Delete]                    │
└─────────────────────────────────────┘

Animation:
- Slides in from right (300ms ease-out)
- Backdrop overlay (fade in)
- Slides out to right on close
```

---

## 🎨 Styling Guidelines

### Table Styles:
```css
.table-container {
  @apply bg-white rounded-lg border border-gray-200 overflow-hidden;
}

.table-header {
  @apply bg-gray-50 border-b border-gray-200;
}

.table-header-cell {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100;
}

.table-row {
  @apply border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}

.table-row-selected {
  @apply bg-blue-50;
}
```

### Status Badge Styles:
```typescript
const statusConfig = {
  applied: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: PaperPlane,
  },
  screening: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Eye,
  },
  interviewing: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Video,
  },
  offer: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Gift,
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  accepted: {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle,
  },
};
```

---

## ✅ Acceptance Criteria

### Visual Requirements:
- [ ] Clean, minimal table design
- [ ] Sortable column headers with visual feedback
- [ ] Row hover states work smoothly
- [ ] Status badges are color-coded correctly
- [ ] Inline actions appear on hover
- [ ] Empty state is clear and actionable
- [ ] Loading skeletons match table structure
- [ ] Mobile responsive (stacked layout)

### Functional Requirements:
- [ ] Fetch applications from Supabase
- [ ] Sort by any column (click header)
- [ ] Filter by status, stage, date range
- [ ] Search by company, position, location
- [ ] Select individual rows (checkbox)
- [ ] Select all rows (header checkbox)
- [ ] Bulk actions work (status change, delete)
- [ ] Find Contacts button triggers automation
- [ ] Application drawer opens on row click
- [ ] Drawer shows all application details
- [ ] Can edit application from drawer
- [ ] Can delete application with confirmation

### Performance Requirements:
- [ ] Table renders 100+ rows smoothly
- [ ] Sorting is instant (client-side)
- [ ] Filtering is fast (<100ms)
- [ ] No layout shift when loading
- [ ] Optimistic updates on status change

---

## 🧪 Testing Checklist

1. **Table Rendering**:
   - [ ] Table loads with applications from Supabase
   - [ ] Columns are properly aligned
   - [ ] Status badges show correct colors
   - [ ] Contact counts are accurate

2. **Sorting**:
   - [ ] Click "Company" header - sorts alphabetically
   - [ ] Click again - reverses sort
   - [ ] Click "Date Applied" - sorts by date
   - [ ] Sort arrow indicator shows direction

3. **Filtering**:
   - [ ] Filter by "Applied" status - shows only applied
   - [ ] Filter by "Has Contacts" - shows apps with contacts
   - [ ] Clear filters - shows all applications
   - [ ] Multiple filters work together (AND logic)

4. **Search**:
   - [ ] Search "Google" - shows Google applications
   - [ ] Search "Engineer" - shows engineering positions
   - [ ] Clear search - shows all applications

5. **Row Interactions**:
   - [ ] Hover row - background changes
   - [ ] Hover row - inline actions appear
   - [ ] Click row - drawer opens
   - [ ] Click checkbox - row selects
   - [ ] Select multiple - bulk actions bar appears

6. **Find Contacts Button**:
   - [ ] Click "Find Contacts" - shows loading state
   - [ ] Wait 2 mins - contacts appear in Supabase
   - [ ] Table updates contact count automatically
   - [ ] Button shows "Find More Contacts (5)"

7. **Application Drawer**:
   - [ ] Click row - drawer slides in from right
   - [ ] Shows all application details
   - [ ] Contacts section shows found contacts
   - [ ] Timeline shows event history
   - [ ] Click backdrop - drawer closes
   - [ ] Click X button - drawer closes

8. **Bulk Actions**:
   - [ ] Select 3 applications
   - [ ] Click "Change Status" - modal opens
   - [ ] Select "Interviewing" - all 3 update
   - [ ] Table refreshes automatically

9. **Empty States**:
   - [ ] No applications - shows empty state
   - [ ] Filters return no results - shows "No matches"
   - [ ] Click "Add Application" - redirects to add form

10. **Mobile Responsive**:
    - [ ] Resize to mobile - table stacks vertically
    - [ ] Cards show instead of table rows
    - [ ] Actions are accessible
    - [ ] Drawer is full-screen on mobile

---

## 📦 Dependencies

```bash
npm install @tanstack/react-table  # For advanced table features
npm install date-fns                # For date formatting
npm install react-hot-toast         # For success/error notifications
```

---

## 🎯 Key Files to Create/Modify

### Create:
- `src/components/crm/applications/ApplicationsTable.tsx`
- `src/components/crm/applications/ApplicationRow.tsx`
- `src/components/crm/applications/StatusBadge.tsx`
- `src/components/crm/applications/FindContactsButton.tsx`
- `src/components/crm/applications/ApplicationDrawer.tsx`
- `src/components/crm/applications/BulkActionsBar.tsx`
- `src/components/crm/applications/FilterPanel.tsx`
- `src/components/crm/shared/EmptyState.tsx`
- `src/components/crm/shared/LoadingTable.tsx`
- `src/lib/supabase/queries/applications.ts`

### Modify:
- `src/app/crm/applications/page.tsx` (replace placeholder)

---

## 🚀 Next Steps

After completing this mega prompt:
1. ✅ Test all table interactions
2. ✅ Verify Supabase queries work
3. ✅ Test Find Contacts button end-to-end
4. ✅ Check mobile responsiveness
5. ✅ Move to **MEGA PROMPT 3** (Contacts Table View)

---

**By the end of this prompt, you'll have a professional applications table that rivals enterprise SaaS products!** 🎉
