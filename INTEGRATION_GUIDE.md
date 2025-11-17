# CRM Features Integration Guide

## Quick Start: How to Use the New Features

### 1. Add Kanban View to Applications Page

Update `/src/app/crm/applications/page.tsx`:

```tsx
import { KanbanBoard } from '@/components/crm/applications/KanbanBoard';
import { BulkActionsMenu } from '@/components/crm/applications/BulkActionsMenu';
import { useState } from 'react';

export default function ApplicationsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  // ... existing code ...

  const handleUpdateStage = async (applicationId: string, newStage: string) => {
    await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    });
    fetchApplications(); // Refresh
  };

  const handleBulkDelete = async () => {
    await fetch('/api/applications/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedApplications }),
    });
    setSelectedApplications([]);
    fetchApplications();
  };

  const handleBulkUpdateStage = async (stage: string) => {
    await fetch('/api/applications/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedApplications, stage }),
    });
    setSelectedApplications([]);
    fetchApplications();
  };

  return (
    <div>
      {/* Add view toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('table')}
          className={viewMode === 'table' ? 'active' : ''}
        >
          Table View
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={viewMode === 'kanban' ? 'active' : ''}
        >
          Kanban View
        </button>
      </div>

      {/* Render appropriate view */}
      {viewMode === 'table' ? (
        <ApplicationsTable
          applications={applications}
          onSelectApplications={setSelectedApplications}
          selectedApplications={selectedApplications}
        />
      ) : (
        <KanbanBoard
          applications={applications}
          onUpdateStage={handleUpdateStage}
        />
      )}

      {/* Add bulk actions */}
      <BulkActionsMenu
        selectedCount={selectedApplications.length}
        onDelete={handleBulkDelete}
        onUpdateStage={handleBulkUpdateStage}
        onArchive={async () => {/* implement */}}
        onExport={() => {/* implement CSV export */}}
        onClear={() => setSelectedApplications([])}
      />
    </div>
  );
}
```

### 2. Add Keyboard Shortcuts

Add to your main layout or page:

```tsx
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutsHelper } from '@/components/crm/shared/ShortcutsHelper';

export default function CRMLayout() {
  useKeyboardShortcuts({
    shortcuts: [
      commonShortcuts.search(() => {
        // Open global search
      }),
      commonShortcuts.newApplication(() => {
        // Open new application modal
      }),
      commonShortcuts.findContacts(() => {
        router.push('/crm/contacts');
      }),
    ],
  });

  return (
    <div>
      {children}
      <ShortcutsHelper />
    </div>
  );
}
```

### 3. Add Realtime Subscriptions

Update your applications page:

```tsx
import { useApplicationsRealtime } from '@/hooks/useRealtimeSubscription';
import { useUser } from '@clerk/nextjs';

export default function ApplicationsPage() {
  const { user } = useUser();

  // Add realtime subscription
  useApplicationsRealtime(user?.id || '', () => {
    fetchApplications(); // Auto-refresh on changes
  });

  // ... rest of component
}
```

For contacts:

```tsx
import { useContactsRealtime } from '@/hooks/useRealtimeSubscription';

export default function ContactsPage() {
  const { user } = useUser();

  useContactsRealtime(user?.id || '', () => {
    fetchContacts(); // Auto-refresh when new contacts arrive
  });

  // ... rest of component
}
```

### 4. Use Enhanced Modals

Replace existing modals:

```tsx
// Instead of ApplicationDetailModal:
import { ApplicationDetailModalEnhanced } from '@/components/crm/applications/ApplicationDetailModalEnhanced';

<ApplicationDetailModalEnhanced
  application={selectedApplication}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onUpdate={async (updates) => {
    await fetch(`/api/applications/${selectedApplication.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    fetchApplications();
  }}
  onDelete={async () => {
    await fetch(`/api/applications/${selectedApplication.id}`, {
      method: 'DELETE',
    });
    fetchApplications();
  }}
/>
```

```tsx
// Instead of ContactDetailModal:
import { ContactDetailModalEnhanced } from '@/components/crm/contacts/ContactDetailModalEnhanced';

<ContactDetailModalEnhanced
  contact={selectedContact}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  jobTitle="Software Engineer" // Optional context
/>
```

### 5. Add Loading Skeletons

Replace loading states:

```tsx
import { TableSkeleton, KanbanSkeleton } from '@/components/crm/shared/Skeletons';

{isLoading ? (
  viewMode === 'table' ? <TableSkeleton /> : <KanbanSkeleton />
) : (
  // Your data component
)}
```

### 6. Add Analytics Link

In your navigation:

```tsx
<Link href="/crm/analytics">
  Analytics
</Link>
```

## API Routes to Create

### 1. Update Application
Create `/src/app/api/applications/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('applications')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

### 2. Bulk Operations
Create `/src/app/api/applications/bulk/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ids, stage } = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('applications')
    .update({ stage })
    .in('id', ids)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ids } = await req.json();
  const supabase = await createClient();

  const { error } = await supabase
    .from('applications')
    .delete()
    .in('id', ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

### 3. AI Contact Recommendations
Create `/src/app/api/contacts/ai-recommendations/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeContacts } from '@/lib/ai/contactRecommendations';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contacts, applicationContext } = await req.json();

  try {
    const recommendations = await analyzeContacts(contacts, applicationContext);
    return NextResponse.json(recommendations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Environment Variables

Add to `.env.local`:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

## Database Migrations (Optional)

Run these to enhance the schema:

```sql
-- Add tags to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
CREATE INDEX IF NOT EXISTS idx_applications_tags ON applications USING GIN(tags);

-- Add interviews to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interviews JSONB DEFAULT '[]'::jsonb;

-- Add engagement tracking to contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contacted_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_count INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS reminders JSONB DEFAULT '[]'::jsonb;
```

## Quick Win: Just Want to See It Work?

The fastest way to see the new features:

1. **Add Kanban Board** - Just swap in KanbanBoard component in applications page
2. **Add Shortcuts Helper** - Add `<ShortcutsHelper />` to your layout
3. **Add Analytics Link** - The analytics page is already complete, just link to it
4. **Use Enhanced Modals** - Replace your modal components with the Enhanced versions

Everything else builds on these core features!

## Troubleshooting

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Check that file paths are correct

### Charts not rendering
- Make sure recharts is installed: `npm install recharts --legacy-peer-deps`
- Check that data is being passed correctly

### AI recommendations failing
- Verify ANTHROPIC_API_KEY is set in environment variables
- Check API rate limits

### Realtime not working
- Verify Supabase realtime is enabled for your tables
- Check Row Level Security policies allow subscriptions
