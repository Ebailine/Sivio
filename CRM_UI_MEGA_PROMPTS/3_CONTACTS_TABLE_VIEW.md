# MEGA PROMPT 3: Contacts Table View & Integration

## 🎯 Objective

Create a professional contacts table that displays all LinkedIn contacts found via Contact Finder. Show AI relevance scores, reasoning, role types, and integrate with the applications table. Users should be able to filter by job, role type, and relevance score.

---

## 📋 Prerequisites

- ✅ **MEGA PROMPT 1** (Layout & Navigation)
- ✅ **MEGA PROMPT 2** (Applications Table)

---

## 🎨 Design Vision

A clean, data-rich table showing:
- Contact name with LinkedIn profile link
- Position and company
- Role type badge (HR, Team, Other)
- Relevance score with color coding
- AI reasoning (truncated with "Read more")
- Which job they're associated with
- Quick actions (View LinkedIn, View Job, Add Note)

---

## 💻 Key Components

### 1. Contacts Table

**File**: `src/components/crm/contacts/ContactsTable.tsx`

Columns:
1. Name (with LinkedIn icon)
2. Position
3. Company
4. Location
5. Role Type (badge)
6. Relevance Score (colored badge)
7. AI Reasoning (truncated, expandable)
8. Job Applied For (link to application)
9. Date Found
10. Actions

---

### 2. Relevance Score Badge

**File**: `src/components/crm/contacts/RelevanceScoreBadge.tsx`

```typescript
Score ranges:
- 90-100: Excellent (green, ★★★★★)
- 80-89:  Great (blue, ★★★★)
- 70-79:  Good (yellow, ★★★)
- 60-69:  Fair (orange, ★★)
- 0-59:   Low (gray, ★)
```

---

### 3. Role Type Badge

**File**: `src/components/crm/contacts/RoleTypeBadge.tsx`

```typescript
const roleConfig = {
  hr: {
    label: 'HR / Recruiting',
    color: 'bg-green-100 text-green-800',
    icon: UserCheck,
  },
  team: {
    label: 'Team Member',
    color: 'bg-blue-100 text-blue-800',
    icon: Users,
  },
  manager: {
    label: 'Manager',
    color: 'bg-purple-100 text-purple-800',
    icon: Crown,
  },
  other: {
    label: 'Other',
    color: 'bg-gray-100 text-gray-800',
    icon: User,
  },
};
```

---

### 4. Contact Drawer

**File**: `src/components/crm/contacts/ContactDrawer.tsx`

Quick-view drawer with:
- Full contact details
- LinkedIn profile (embedded or link)
- Full AI reasoning
- Associated job application
- Notes section
- Contact history
- Quick actions (email, LinkedIn message, add to favorites)

---

### 5. Contacts Page

**File**: `src/app/crm/contacts/page.tsx`

Server component that:
- Fetches contacts from Supabase
- Implements filters (job, role type, score)
- Implements search (name, position, company)
- Passes data to ContactsTable

---

### 6. Supabase Queries

**File**: `src/lib/supabase/queries/contacts.ts`

```typescript
export async function getContacts(userId: string, filters?: {
  applicationId?: string;
  roleType?: string;
  minScore?: number;
  search?: string;
  sortBy?: string;
}) {
  // Fetch contacts with application details
  // Join with applications table
  // Apply filters
  // Sort by relevance_score DESC by default
}

export async function getContactById(contactId: string) {
  // Fetch single contact with full details
}

export async function getContactsByApplication(applicationId: string) {
  // Fetch all contacts for a specific job
  // Sort by relevance score
}

export async function updateContactNotes(
  contactId: string,
  notes: string
) {
  // Update contact notes
}
```

---

## 📝 Detailed Specifications

### ContactsTable Component

```typescript
interface ContactsTableProps {
  contacts: Contact[];
  isLoading?: boolean;
  onSort: (column: string) => void;
  onFilter: (filters: FilterState) => void;
}

Features:
1. Sortable Columns
   - Name (alphabetical)
   - Relevance Score (numerical, default DESC)
   - Date Found (chronological)

2. Filterable Columns
   - Role Type: HR, Team, Manager, Other
   - Relevance Score: 80+, 60-80, <60
   - Job Application: Dropdown of all jobs

3. Row Interactions
   - Click row → Open ContactDrawer
   - Click LinkedIn icon → Open LinkedIn profile (new tab)
   - Click job name → Navigate to application detail
   - Hover → Show quick actions

4. Quick Actions
   - View LinkedIn
   - View Job Application
   - Copy Email (if available)
   - Add/Edit Notes
   - Mark as Contacted
   - Add to Favorites

5. Empty State
   - No contacts yet: "Find contacts from your applications"
   - CTA button: "Go to Applications"
   - Filters return no results: "No contacts match filters"

6. Loading State
   - Skeleton rows
   - Shimmer effect
```

### Contact Card (Mobile View)

When screen < 768px, switch to card layout:

```
┌─────────────────────────────────────────┐
│ ⭐ 98  HR / Recruiting                  │
│                                         │
│ Samantha Jacobs                         │
│ Recruiting Manager at Solomon Page      │
│ New York City Metropolitan Area         │
│                                         │
│ "Recruiting Manager - perfect HR        │
│  contact for initial outreach."         │
│                                         │
│ Applied for: Manager of Visual...       │
│ Found: 2 days ago                       │
│                                         │
│ [View LinkedIn] [View Job] [...]        │
└─────────────────────────────────────────┘
```

---

## 🎨 Styling Guidelines

### Table Styles

```css
.contacts-table {
  @apply bg-white rounded-lg border border-gray-200;
}

.contact-row {
  @apply border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors;
}

.contact-row-hr {
  @apply border-l-4 border-l-green-500;
}

.linkedin-link {
  @apply inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline;
}
```

### Relevance Score Styles

```typescript
function getScoreConfig(score: number) {
  if (score >= 90) return {
    color: 'bg-green-100 text-green-800 border-green-300',
    label: 'Excellent',
    stars: 5,
  };
  if (score >= 80) return {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    label: 'Great',
    stars: 4,
  };
  if (score >= 70) return {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    label: 'Good',
    stars: 3,
  };
  if (score >= 60) return {
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    label: 'Fair',
    stars: 2,
  };
  return {
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    label: 'Low',
    stars: 1,
  };
}
```

---

## 🔗 Integration with Applications

### Show Contacts in Application Drawer

Update `ApplicationDrawer.tsx` to include:

```typescript
<ContactsPreview
  applicationId={application.id}
  limit={3}
  showViewAll={contactsCount > 3}
/>
```

This shows the top 3 contacts by relevance score, with a "View All Contacts" link that navigates to `/crm/contacts?applicationId={id}`.

### Link from Contacts to Application

Each contact row should show the job it's associated with:

```typescript
<Link
  href={`/crm/applications/${contact.applicationId}`}
  className="text-sm text-blue-600 hover:underline"
>
  {contact.jobAppliedFor}
</Link>
```

---

## ✅ Acceptance Criteria

### Visual Requirements:
- [ ] Clean table with proper spacing
- [ ] Relevance scores show color-coded badges
- [ ] Role type badges are color-coded
- [ ] LinkedIn links are blue and clickable
- [ ] AI reasoning is truncated with "...Read more"
- [ ] Mobile cards are well-designed
- [ ] Empty state is clear and actionable

### Functional Requirements:
- [ ] Fetch contacts from Supabase
- [ ] Sort by score, name, date
- [ ] Filter by role type, score range, job
- [ ] Search by name, position, company
- [ ] Click row → Open ContactDrawer
- [ ] Click LinkedIn icon → Open in new tab
- [ ] Click job name → Navigate to application
- [ ] Mark contact as "Contacted"
- [ ] Add notes to contact

### Data Accuracy:
- [ ] Relevance scores match Supabase values
- [ ] Role types match (hr, team, other)
- [ ] AI reasoning displays correctly
- [ ] Job associations are correct
- [ ] Contact counts match

---

## 🧪 Testing Checklist

1. **Table Rendering**:
   - [ ] Table loads with contacts from Supabase
   - [ ] All columns display correctly
   - [ ] Relevance scores show proper colors
   - [ ] Role type badges show proper colors

2. **Sorting**:
   - [ ] Default sort: Relevance Score (high to low)
   - [ ] Click "Name" → Sorts alphabetically
   - [ ] Click "Score" → Toggles high/low
   - [ ] Click "Date" → Sorts by date found

3. **Filtering**:
   - [ ] Filter by "HR" → Shows only HR contacts
   - [ ] Filter by "80+ score" → Shows high scores
   - [ ] Filter by job → Shows contacts for that job
   - [ ] Multiple filters work together

4. **Search**:
   - [ ] Search "Samantha" → Finds Samantha Jacobs
   - [ ] Search "Recruiter" → Finds recruiting positions
   - [ ] Search "Solomon Page" → Finds all SP contacts

5. **Row Interactions**:
   - [ ] Click row → Drawer opens
   - [ ] Click LinkedIn icon → Opens LinkedIn profile
   - [ ] Click job name → Navigates to application
   - [ ] Hover row → Quick actions appear

6. **Contact Drawer**:
   - [ ] Shows full contact details
   - [ ] Shows full AI reasoning (not truncated)
   - [ ] Shows associated job with link
   - [ ] Can add/edit notes
   - [ ] Can mark as contacted

7. **Integration**:
   - [ ] Application drawer shows top contacts
   - [ ] "View All Contacts" navigates with filter
   - [ ] Contact counts are accurate
   - [ ] New contacts appear after running Contact Finder

8. **Mobile Responsive**:
   - [ ] Cards display on mobile
   - [ ] All info is accessible
   - [ ] Quick actions work
   - [ ] Drawer is full-screen

---

## 📦 Dependencies

No new dependencies needed (use existing).

---

## 🎯 Key Files

### Create:
- `src/components/crm/contacts/ContactsTable.tsx`
- `src/components/crm/contacts/ContactRow.tsx`
- `src/components/crm/contacts/ContactCard.tsx` (mobile)
- `src/components/crm/contacts/ContactDrawer.tsx`
- `src/components/crm/contacts/RelevanceScoreBadge.tsx`
- `src/components/crm/contacts/RoleTypeBadge.tsx`
- `src/components/crm/contacts/FilterPanel.tsx`
- `src/components/crm/contacts/ContactsPreview.tsx`
- `src/lib/supabase/queries/contacts.ts`

### Modify:
- `src/app/crm/contacts/page.tsx` (replace placeholder)
- `src/components/crm/applications/ApplicationDrawer.tsx` (add contacts preview)

---

## 🚀 Next Steps

After this prompt:
1. ✅ Test all contact table features
2. ✅ Verify integration with applications
3. ✅ Test filtering and search
4. ✅ Check mobile responsiveness
5. ✅ Move to **MEGA PROMPT 4** (Application Detail View)

---

**You'll now have a beautiful contacts table that showcases the power of your Contact Finder!** 🎉
