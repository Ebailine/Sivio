# Simple CRM Update Instructions

## Quick 3-Step Integration

### Step 1: Add Import (Line ~15)

Add this import near the top with other component imports:

```typescript
import CRMEnhanced from '@/components/crm/CRMEnhanced'
```

### Step 2: Add userCredits State (Line ~198)

Add this state variable with the other useState declarations:

```typescript
const [userCredits, setUserCredits] = useState(0)
```

### Step 3: Fetch Credits in useEffect (Line ~222)

Update the useEffect to fetch credits:

```typescript
useEffect(() => {
  if (!isLoaded) return
  if (!isSignedIn) {
    router.push('/sign-in')
    return
  }

  fetchApplications()
  fetchUserCredits()  // ADD THIS LINE
}, [isLoaded, isSignedIn, router])

// ADD THIS FUNCTION after fetchApplications:
const fetchUserCredits = async () => {
  try {
    const response = await fetch('/api/users/me')
    const data = await response.json()
    if (response.ok && data.user) {
      setUserCredits(data.user.credits || 0)
    }
  } catch (error) {
    console.error('Error fetching credits:', error)
  }
}
```

### Step 4: Wrap Kanban Board (Find the DndContext section, around line 430)

Find this code:

```typescript
{/* Kanban Board */}
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {/* ... rest of kanban code ... */}
  </div>

  <DragOverlay>
    {/* ... drag overlay code ... */}
  </DragOverlay>
</DndContext>
```

Replace the ENTIRE section with:

```typescript
{/* Enhanced CRM with Table View + Contact Finder */}
<CRMEnhanced
  applications={filteredApplications}
  userCredits={userCredits}
  onRefresh={() => {
    fetchApplications()
    fetchUserCredits()
  }}
  onOpenDetails={openDetailModal}
  onDelete={deleteApplication}
  kanbanView={
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageApplications = groupedApplications[stage.id] || []

          return (
            <DroppableColumn
              key={stage.id}
              stage={stage}
              applications={stageApplications}
              onOpenDetail={openDetailModal}
              onDelete={deleteApplication}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeId ? (
          <ApplicationCard
            application={applications.find(app => app.id === activeId)!}
            onOpen={() => {}}
            onDelete={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  }
/>
```

---

## Done! 🎉

That's it! The CRM now has:
- ✅ Table view toggle
- ✅ Checkboxes for job selection
- ✅ Contact Finder button
- ✅ Full integration with existing Kanban view

The table view will appear when you click the "Table" toggle button!
