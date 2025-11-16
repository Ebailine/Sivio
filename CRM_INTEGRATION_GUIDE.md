# CRM Table View Integration Guide

## Quick Integration Steps

### Step 1: Add Imports to `src/app/crm/page.tsx`

Add these imports at the top of the file (around line 7-32):

```typescript
import ContactFinderModal from '@/components/contact-finder/ContactFinderModal'
import ApplicationsTable from '@/components/crm/ApplicationsTable'
import { LayoutGrid, List, Users } from 'lucide-react' // Add these icons
```

### Step 2: Add State Variables

Add these state variables in the CRMPage component (around line 197-204):

```typescript
// ADD THESE NEW STATE VARIABLES:
const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([])
const [isContactFinderOpen, setIsContactFinderOpen] = useState(false)
const [userCredits, setUserCredits] = useState(0)
```

### Step 3: Fetch User Credits

Add this function to fetch credits (around line 240, after fetchApplications):

```typescript
const fetchUserCredits = async () => {
  try {
    const response = await fetch('/api/users/me')
    const data = await response.json()
    if (response.ok) {
      setUserCredits(data.user.credits || 0)
    }
  } catch (error) {
    console.error('Error fetching user credits:', error)
  }
}
```

And call it in the useEffect:

```typescript
useEffect(() => {
  if (!isLoaded) return
  if (!isSignedIn) {
    router.push('/sign-in')
    return
  }

  fetchApplications()
  fetchUserCredits() // ADD THIS LINE
}, [isLoaded, isSignedIn, router])
```

### Step 4: Add Selection Handlers

Add these handlers (around line 300):

```typescript
const handleToggleSelect = (appId: string) => {
  setSelectedApplicationIds(prev =>
    prev.includes(appId)
      ? prev.filter(id => id !== appId)
      : [...prev, appId]
  )
}

const handleToggleSelectAll = () => {
  if (selectedApplicationIds.length === applications.length) {
    setSelectedApplicationIds([])
  } else {
    setSelectedApplicationIds(applications.map(app => app.id))
  }
}

const handleContactFinderSuccess = () => {
  // Refresh applications and credits
  fetchApplications()
  fetchUserCredits()
  setSelectedApplicationIds([]) // Clear selection
}
```

### Step 5: Add View Toggle & Contact Finder Button

Find the header section (around line 400-450) and add this BEFORE the Kanban columns:

```typescript
{/* View Toggle & Contact Finder Button */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
    <button
      onClick={() => setViewMode('kanban')}
      className={\`px-4 py-2 rounded-lg font-semibold transition-all \${
        viewMode === 'kanban'
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
          : 'text-gray-600 hover:text-gray-900'
      }\`}
    >
      <LayoutGrid size={18} className="inline mr-2" />
      Kanban
    </button>
    <button
      onClick={() => setViewMode('table')}
      className={\`px-4 py-2 rounded-lg font-semibold transition-all \${
        viewMode === 'table'
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
          : 'text-gray-600 hover:text-gray-900'
      }\`}
    >
      <List size={18} className="inline mr-2" />
      Table
    </button>
  </div>

  {viewMode === 'table' && selectedApplicationIds.length > 0 && (
    <button
      onClick={() => setIsContactFinderOpen(true)}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
    >
      <Users size={20} />
      Contact Finder ({selectedApplicationIds.length})
    </button>
  )}
</div>
```

### Step 6: Add Conditional Rendering

Replace the Kanban board rendering with conditional rendering:

```typescript
{/* Kanban View */}
{viewMode === 'kanban' && (
  <DndContext
    sensors={sensors}
    collisionDetection={closestCenter}
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
  >
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {STAGES.map(stage => (
        // ... existing Kanban column code ...
      ))}
    </div>

    <DragOverlay>
      {activeId ? (
        // ... existing drag overlay code ...
      ) : null}
    </DragOverlay>
  </DndContext>
)}

{/* Table View */}
{viewMode === 'table' && (
  <ApplicationsTable
    applications={applications}
    selectedIds={selectedApplicationIds}
    onToggleSelect={handleToggleSelect}
    onToggleSelectAll={handleToggleSelectAll}
    onOpenDetails={(app) => {
      setSelectedApplication(app)
      setIsDetailModalOpen(true)
    }}
    onDelete={deleteApplication}
  />
)}
```

### Step 7: Add Contact Finder Modal

At the end of the component, before the closing tags, add:

```typescript
{/* Contact Finder Modal */}
<ContactFinderModal
  isOpen={isContactFinderOpen}
  onClose={() => setIsContactFinderOpen(false)}
  selectedApplications={applications.filter(app =>
    selectedApplicationIds.includes(app.id)
  )}
  userCredits={userCredits}
  onSuccess={handleContactFinderSuccess}
/>
```

---

## Alternative: Complete CRM Page Replacement

If you prefer, I can create a completely new CRM page file with everything integrated.
Would you like me to:

**Option A**: Continue with manual integration (follow steps above)
**Option B**: Create a complete new CRM page file (will be faster but replaces existing file)

Let me know which you prefer!
