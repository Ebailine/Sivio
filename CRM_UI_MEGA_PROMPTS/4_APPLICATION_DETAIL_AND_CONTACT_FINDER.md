# MEGA PROMPT 4: Application Detail View & Contact Finder Integration

## 🎯 Objective

Create a comprehensive application detail page that shows everything about a job application, integrates the Contact Finder workflow with real-time progress updates, and displays found contacts in a beautiful layout.

---

## 📋 Prerequisites

- ✅ **MEGA PROMPTS 1, 2, 3** completed

---

## 🎨 Page Layout

```
┌──────────────────────────────────────────────────────────┐
│ Breadcrumbs: Dashboard > Applications > Google - SWE    │
│                                                          │
│ Page Header: [← Back] Company @ Position     [Edit]     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ APPLICATION OVERVIEW CARD                                │
│ ┌────────────────────────────────────────────────────┐  │
│ │  [Logo] Google                                     │  │
│ │         Senior Software Engineer                   │  │
│ │         Mountain View, CA                          │  │
│ │                                                    │  │
│ │  Applied Badge  •  Interviewing Badge             │  │
│ │                                                    │  │
│ │  Applied: Jan 15, 2025  •  Updated: 2 days ago   │  │
│ │  Salary: $180k-$220k    •  Remote: Hybrid        │  │
│ │                                                    │  │
│ │  [View Job Posting] [Edit] [Archive]             │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ CONTACT FINDER PANEL                                     │
│ ┌────────────────────────────────────────────────────┐  │
│ │  Find the best contacts to reach out to           │  │
│ │                                                    │  │
│ │  [Find Contacts] or [Find More Contacts (5)]      │  │
│ │                                                    │  │
│ │  Progress: ████████░░ 80% - Analyzing with AI...  │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ CONTACTS FOUND (5)              [Sort: Relevance ▼]      │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ ⭐ 98  HR / Recruiting                             │  │
│ │                                                    │  │
│ │ Samantha Jacobs                   [LinkedIn] [✉️]  │  │
│ │ Recruiting Manager                                │  │
│ │ New York, NY                                      │  │
│ │                                                    │  │
│ │ "Recruiting Manager - perfect HR contact for      │  │
│ │  initial outreach. Direct access to hiring..."    │  │
│ │                                                    │  │
│ │ [Contact via LinkedIn] [Add Note]                 │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ... (4 more contact cards) ...                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ APPLICATION TIMELINE                                     │
│                                                          │
│ • Application created - Jan 15, 2025                     │
│ • Status changed to "Screening" - Jan 17                 │
│ • 5 contacts found - Jan 18                              │
│ • Note added: "Reached out to Samantha" - Jan 19         │
│ • Status changed to "Interviewing" - Jan 20              │
└──────────────────────────────────────────────────────────┘
```

---

## 💻 Components to Build

### 1. Application Detail Page

**File**: `src/app/crm/applications/[id]/page.tsx`

Server component that:
- Fetches application by ID
- Fetches contacts for this application
- Handles not found (404)
- Passes data to client components

---

### 2. Application Overview Card

**File**: `src/components/crm/applications/ApplicationOverview.tsx`

Displays:
- Company logo (if available) + name
- Position title
- Location
- Status and stage badges
- Key details (salary, type, dates)
- Quick actions (edit, archive, view posting)

---

### 3. Contact Finder Panel

**File**: `src/components/crm/applications/ContactFinderPanel.tsx`

The star of this page! Shows:
- Explanation text
- "Find Contacts" button (or "Find More" if contacts exist)
- Real-time progress bar when running
- Progress stages:
  1. Starting workflow... (0-10%)
  2. Scraping LinkedIn... (10-40%)
  3. Analyzing with AI... (40-80%)
  4. Saving contacts... (80-100%)
  5. Complete! ✓

Implementation:
```typescript
- Polls /api/contact-finder/status endpoint
- Updates progress bar in real-time
- Shows success message when complete
- Automatically refreshes contacts list
- Handles errors gracefully
```

---

### 4. Contacts Section

**File**: `src/components/crm/applications/ApplicationContacts.tsx`

Shows all contacts for this application:
- Sort dropdown (Relevance, Name, Date Found)
- Contact cards with full details
- Quick actions per contact
- Empty state if no contacts
- "Find Contacts" CTA if empty

---

### 5. Contact Card (Expanded)

**File**: `src/components/crm/applications/ContactCard.tsx`

Larger, more detailed card than table row:

```
┌──────────────────────────────────────────────────────┐
│ ⭐ 98  HR / Recruiting                               │
│                                                      │
│ Samantha Jacobs                     [in] [Email]     │
│ Recruiting Manager at Solomon Page                   │
│ New York City Metropolitan Area                      │
│                                                      │
│ AI Reasoning:                                        │
│ "Recruiting Manager with direct hiring authority.    │
│  Perfect HR contact for initial outreach. Has been   │
│  with Solomon Page for 3+ years and actively posts   │
│  about hiring on LinkedIn."                          │
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │ Notes:                                       │    │
│ │ [Add a note about this contact...]          │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ [Contact via LinkedIn] [Mark as Contacted] [...]     │
│                                                      │
│ Found 2 days ago                                     │
└──────────────────────────────────────────────────────┘
```

---

### 6. Application Timeline

**File**: `src/components/crm/applications/ApplicationTimeline.tsx`

Shows chronological history:
- Application created
- Status changes
- Contacts found events
- Notes added
- Interviews scheduled
- Offers received

Each event shows:
- Icon
- Description
- Timestamp (relative, e.g., "2 days ago")

---

### 7. Progress Tracker

**File**: `src/components/crm/applications/ContactFinderProgress.tsx`

Real-time progress indicator:

```typescript
interface ProgressStage {
  label: string;
  percentage: number;
  icon: React.ReactNode;
}

const stages: ProgressStage[] = [
  { label: 'Starting workflow...', percentage: 10, icon: <Play /> },
  { label: 'Scraping LinkedIn...', percentage: 40, icon: <Search /> },
  { label: 'Analyzing with AI...', percentage: 80, icon: <Brain /> },
  { label: 'Saving contacts...', percentage: 95, icon: <Save /> },
  { label: 'Complete!', percentage: 100, icon: <CheckCircle /> },
];
```

Visual design:
```
Starting workflow...

████████████░░░░░░░░ 60%

Analyzing with AI...
```

---

## 🔄 Real-Time Updates

### How Contact Finder Integration Works:

1. **User clicks "Find Contacts"**:
   - Call `/api/contact-finder/trigger`
   - Immediately show progress at 0%
   - Store job ID in state

2. **Poll for status**:
   ```typescript
   useEffect(() => {
     if (!isRunning) return;

     const interval = setInterval(async () => {
       const status = await fetch(`/api/contact-finder/status?jobId=${jobId}`);
       const data = await status.json();

       setProgress(data.progress);
       setStage(data.stage);

       if (data.complete) {
         clearInterval(interval);
         refreshContacts();
         showSuccessMessage();
       }
     }, 2000); // Poll every 2 seconds

     return () => clearInterval(interval);
   }, [isRunning]);
   ```

3. **Update UI in real-time**:
   - Progress bar fills
   - Stage label updates
   - Icon changes

4. **On completion**:
   - Show success message
   - Refresh contacts list
   - Update contact count
   - Show new contacts with animation

---

## 🎨 Styling Details

### Application Overview Card

```css
.application-overview {
  @apply bg-white rounded-xl border border-gray-200 p-8 shadow-sm;
}

.company-header {
  @apply flex items-start gap-4;
}

.company-logo {
  @apply h-16 w-16 rounded-lg border border-gray-200 bg-white p-2;
}

.company-info {
  @apply flex-1;
}

.company-name {
  @apply text-2xl font-bold text-gray-900;
}

.position-title {
  @apply text-xl text-gray-700 mt-1;
}

.location {
  @apply text-sm text-gray-500 mt-1 flex items-center gap-1;
}
```

### Contact Finder Panel

```css
.finder-panel {
  @apply bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6;
}

.finder-cta {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

.progress-bar-container {
  @apply bg-white rounded-full h-3 overflow-hidden border border-gray-200;
}

.progress-bar-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out;
}

.progress-label {
  @apply text-sm font-medium text-gray-700 mt-2 flex items-center gap-2;
}
```

### Contact Card

```css
.contact-card {
  @apply bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all;
}

.contact-card-hr {
  @apply border-l-4 border-l-green-500;
}

.contact-header {
  @apply flex items-start justify-between;
}

.contact-name {
  @apply text-lg font-semibold text-gray-900 hover:text-blue-600;
}

.contact-title {
  @apply text-sm text-gray-600 mt-1;
}

.ai-reasoning {
  @apply mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-gray-700 italic;
}
```

---

## ✅ Acceptance Criteria

### Visual Requirements:
- [ ] Clean, professional layout
- [ ] Application overview card is prominent
- [ ] Contact Finder panel stands out
- [ ] Progress bar animates smoothly
- [ ] Contact cards are well-designed
- [ ] Timeline is chronological and clear
- [ ] Mobile responsive

### Functional Requirements:
- [ ] Fetch application by ID from Supabase
- [ ] Fetch contacts for this application
- [ ] Click "Find Contacts" → triggers automation
- [ ] Progress updates in real-time
- [ ] Contacts appear when complete
- [ ] Can add notes to contacts
- [ ] Can mark contacts as "Contacted"
- [ ] Timeline shows all events
- [ ] Back button navigates to applications table
- [ ] Edit button opens edit modal

### Real-Time Features:
- [ ] Progress bar fills smoothly
- [ ] Stage label updates every 2 seconds
- [ ] On completion, shows success message
- [ ] Contacts list refreshes automatically
- [ ] New contacts appear with animation
- [ ] Error states are handled gracefully

---

## 🧪 Testing Checklist

1. **Page Load**:
   - [ ] Navigate to /crm/applications/[id]
   - [ ] Application details load
   - [ ] Existing contacts display
   - [ ] Timeline shows events

2. **Contact Finder Workflow**:
   - [ ] Click "Find Contacts"
   - [ ] Progress bar appears at 0%
   - [ ] Progress updates every 2 seconds
   - [ ] Stage labels change:
     - Starting workflow...
     - Scraping LinkedIn...
     - Analyzing with AI...
     - Saving contacts...
     - Complete!
   - [ ] On completion: success message shows
   - [ ] Contacts list refreshes
   - [ ] New contacts appear

3. **Contact Interactions**:
   - [ ] Click LinkedIn icon → Opens profile
   - [ ] Click "Contact via LinkedIn" → Opens LinkedIn messaging
   - [ ] Add note → Saves to Supabase
   - [ ] Mark as contacted → Updates status

4. **Timeline**:
   - [ ] Shows all events in order
   - [ ] Timestamps are relative (e.g., "2 days ago")
   - [ ] Icons match event types

5. **Navigation**:
   - [ ] Back button → Returns to applications table
   - [ ] Edit button → Opens edit modal
   - [ ] Contact name → Opens contact drawer
   - [ ] Breadcrumbs work correctly

6. **Error Handling**:
   - [ ] Invalid application ID → Shows 404
   - [ ] Contact Finder fails → Shows error message
   - [ ] Network error → Shows retry option

7. **Mobile Responsive**:
   - [ ] Layout stacks on mobile
   - [ ] Contact cards are full-width
   - [ ] Actions are accessible
   - [ ] Progress bar is visible

---

## 📦 API Endpoints Needed

### Status Polling Endpoint

**File**: `src/app/api/contact-finder/status/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  // Check if n8n workflow is still running
  // Return progress percentage and stage
  // Return complete: true when done

  return NextResponse.json({
    progress: 60,
    stage: 'Analyzing with AI...',
    complete: false,
  });
}
```

---

## 🎯 Key Files

### Create:
- `src/app/crm/applications/[id]/page.tsx`
- `src/components/crm/applications/ApplicationOverview.tsx`
- `src/components/crm/applications/ContactFinderPanel.tsx`
- `src/components/crm/applications/ContactFinderProgress.tsx`
- `src/components/crm/applications/ApplicationContacts.tsx`
- `src/components/crm/applications/ContactCard.tsx`
- `src/components/crm/applications/ApplicationTimeline.tsx`
- `src/app/api/contact-finder/status/route.ts`

### Modify:
- None (all new files)

---

## 🚀 Next Steps

After this prompt:
1. ✅ Test end-to-end Contact Finder flow
2. ✅ Verify real-time updates work
3. ✅ Test on real data from Supabase
4. ✅ Check mobile responsiveness
5. ✅ Move to **MEGA PROMPT 5** (Dashboard & Polish)

---

**This is where your Contact Finder automation truly shines in the UI!** ✨
