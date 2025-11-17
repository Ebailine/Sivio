# MEGA PROMPT 1: CRM Layout & Navigation System

## 🎯 Objective

Build a professional, minimalist CRM layout with sidebar navigation, breadcrumbs, and shared components. This is the **foundation** for all subsequent prompts. The layout should be clean, easy to navigate, and mobile-responsive.

---

## 📋 What You're Building

### Core Components:
1. **CRMLayout** - Main layout wrapper with sidebar + content area
2. **CRMSidebar** - Fixed sidebar navigation with icons and labels
3. **PageHeader** - Reusable page header with title, breadcrumbs, and actions
4. **Breadcrumbs** - Navigation breadcrumbs for context
5. **StatCard** - Dashboard statistics card component

### Routes to Create:
- `/crm` - Dashboard (placeholder for now)
- `/crm/applications` - Applications page (placeholder)
- `/crm/contacts` - Contacts page (placeholder)

---

## 🎨 Design Specifications

### Layout Structure:
```
┌────────────────────────────────────────────────────────┐
│  Sidebar (fixed)  │  Main Content Area                 │
│                   │                                     │
│  Logo             │  PageHeader                         │
│                   │  ├─ Breadcrumbs                    │
│  Navigation       │  ├─ Page Title                     │
│  ├─ Dashboard     │  └─ Actions                        │
│  ├─ Applications  │                                     │
│  ├─ Contacts      │  Content                           │
│  └─ Settings      │  (children)                        │
│                   │                                     │
│  User Info        │                                     │
└────────────────────────────────────────────────────────┘
```

### Sidebar Specifications:
- **Width**: 280px (desktop), 72px (collapsed), full width (mobile)
- **Background**: White with subtle border-right
- **Shadow**: None (minimal design)
- **Position**: Fixed on desktop, drawer on mobile
- **Logo**: Sivio logo + wordmark at top
- **Navigation**: Icons + labels, active state highlighting
- **User section**: At bottom with avatar + name + credits

### Page Header Specifications:
- **Height**: Auto (min 80px padding)
- **Background**: White
- **Border**: Subtle bottom border
- **Layout**: Breadcrumbs → Title → Actions (flex justify-between)

### Color Palette:
```css
/* Backgrounds */
--bg-primary: #ffffff
--bg-secondary: #f9fafb
--bg-hover: #f3f4f6

/* Borders */
--border-light: #e5e7eb
--border-medium: #d1d5db

/* Text */
--text-primary: #111827
--text-secondary: #6b7280
--text-tertiary: #9ca3af

/* Brand */
--primary: #3b82f6
--primary-hover: #2563eb
--primary-light: #dbeafe

/* Status */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

---

## 💻 Implementation Details

### 1. Create CRM Layout Component

**File**: `src/components/crm/layout/CRMLayout.tsx`

```typescript
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CRMSidebar } from './CRMSidebar';
import { motion, AnimatePresence } from 'framer-motion';

interface CRMLayoutProps {
  children: React.ReactNode;
}

export function CRMLayout({ children }: CRMLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <CRMSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Sivio CRM
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Key Features**:
- Mobile-responsive with drawer sidebar
- Backdrop overlay on mobile
- Fixed sidebar on desktop
- Smooth animations with Framer Motion
- Clean, minimal design

---

### 2. Create CRM Sidebar Component

**File**: `src/components/crm/layout/CRMSidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  X,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CRMSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
  { name: 'Applications', href: '/crm/applications', icon: Briefcase },
  { name: 'Contacts', href: '/crm/contacts', icon: Users },
  { name: 'Settings', href: '/crm/settings', icon: Settings },
];

export function CRMSidebar({ isOpen, onClose }: CRMSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // Fetch user credits from your API
  const userCredits = 0; // TODO: Replace with actual credits fetch

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/crm" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold text-gray-900">Sivio</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors',
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5 shrink-0',
                              isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>

              {/* User info at bottom */}
              <li className="-mx-6 mt-auto">
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 border-t border-gray-200">
                  <img
                    className="h-8 w-8 rounded-full bg-gray-50"
                    src={user?.imageUrl || '/default-avatar.png'}
                    alt=""
                  />
                  <span className="flex-1 truncate">
                    <span className="block truncate text-sm font-medium">
                      {user?.firstName || 'User'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <CreditCard className="h-3 w-3" />
                      {userCredits} credits
                    </span>
                  </span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 z-50 flex w-72 flex-col bg-white lg:hidden"
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6 pb-2">
          {/* Mobile header */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Link href="/crm" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold text-gray-900">Sivio</span>
            </Link>
            <button
              onClick={onClose}
              className="-m-2.5 p-2.5 text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Same navigation as desktop */}
          <nav className="flex flex-1 flex-col">
            {/* ... same as desktop nav ... */}
          </nav>
        </div>
      </motion.div>
    </>
  );
}
```

**Key Features**:
- Active state highlighting
- Icon + label navigation
- User info with credits at bottom
- Mobile drawer with smooth animation
- Hover states and transitions

---

### 3. Create Page Header Component

**File**: `src/components/crm/layout/PageHeader.tsx`

```typescript
'use client';

import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} />
        )}

        {/* Title and actions */}
        <div className="mt-2 md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0 gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Create Breadcrumbs Component

**File**: `src/components/crm/layout/Breadcrumbs.tsx`

```typescript
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm font-medium',
                    isLast ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

---

### 5. Create Stat Card Component

**File**: `src/components/crm/shared/StatCard.tsx`

```typescript
'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="mt-2 flex items-center text-sm">
              <span
                className={cn(
                  'font-medium',
                  change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change.trend === 'up' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="ml-2 text-gray-500">from last month</span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg bg-gray-50', iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
```

---

### 6. Update CRM Layout File

**File**: `src/app/crm/layout.tsx`

```typescript
import { CRMLayout } from '@/components/crm/layout/CRMLayout';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function CRMLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <CRMLayout>{children}</CRMLayout>;
}
```

---

### 7. Create Placeholder Pages

**File**: `src/app/crm/page.tsx` (Dashboard)

```typescript
import { PageHeader } from '@/components/crm/layout/PageHeader';
import { StatCard } from '@/components/crm/shared/StatCard';
import { Briefcase, Users, TrendingUp, Target } from 'lucide-react';

export default function CRMDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Dashboard"
        description="Overview of your job applications and contacts"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Applications"
            value="24"
            change={{ value: 12, trend: 'up' }}
            icon={Briefcase}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Contacts Found"
            value="156"
            change={{ value: 23, trend: 'up' }}
            icon={Users}
            iconColor="text-green-600"
          />
          <StatCard
            title="Response Rate"
            value="34%"
            change={{ value: 5, trend: 'up' }}
            icon={TrendingUp}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Interviews"
            value="8"
            change={{ value: 2, trend: 'up' }}
            icon={Target}
            iconColor="text-orange-600"
          />
        </div>

        {/* Placeholder for future content */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            Dashboard content coming in Mega Prompt 5
          </p>
        </div>
      </div>
    </div>
  );
}
```

**File**: `src/app/crm/applications/page.tsx`

```typescript
import { PageHeader } from '@/components/crm/layout/PageHeader';

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Applications"
        description="Track all your job applications in one place"
        breadcrumbs={[
          { label: 'Dashboard', href: '/crm' },
          { label: 'Applications' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            Applications table coming in Mega Prompt 2
          </p>
        </div>
      </div>
    </div>
  );
}
```

**File**: `src/app/crm/contacts/page.tsx`

```typescript
import { PageHeader } from '@/components/crm/layout/PageHeader';

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Contacts"
        description="Manage contacts found through Contact Finder"
        breadcrumbs={[
          { label: 'Dashboard', href: '/crm' },
          { label: 'Contacts' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            Contacts table coming in Mega Prompt 3
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Acceptance Criteria

After completing this mega prompt, you should have:

### ✅ Visual Requirements:
- [ ] Clean, professional sidebar navigation
- [ ] Active navigation state highlighting
- [ ] Mobile-responsive drawer sidebar
- [ ] Page headers with breadcrumbs
- [ ] Consistent spacing and typography
- [ ] Smooth animations and transitions

### ✅ Functional Requirements:
- [ ] Navigation between /crm, /crm/applications, /crm/contacts works
- [ ] Active route highlighting works correctly
- [ ] Mobile sidebar opens/closes smoothly
- [ ] Breadcrumbs show current location
- [ ] User info displays in sidebar
- [ ] Stat cards render with proper styling

### ✅ Code Quality:
- [ ] All TypeScript types are properly defined
- [ ] Components are reusable and well-organized
- [ ] Tailwind classes use consistent naming
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile, tablet, desktop

---

## 🧪 Testing Checklist

- [ ] Navigate to /crm - Dashboard loads
- [ ] Click "Applications" - Navigate to /crm/applications
- [ ] Click "Contacts" - Navigate to /crm/contacts
- [ ] Click "Dashboard" breadcrumb - Navigate back to /crm
- [ ] Resize browser - Sidebar becomes mobile drawer
- [ ] Open mobile menu - Drawer slides in
- [ ] Close mobile menu - Drawer slides out
- [ ] Active route is highlighted correctly
- [ ] Hover states work on navigation items
- [ ] User avatar and credits display in sidebar

---

## 📦 Dependencies to Install

```bash
npm install framer-motion
npm install lucide-react
```

---

## 🎯 Next Steps

After completing this prompt:
1. ✅ Test all navigation flows
2. ✅ Verify mobile responsiveness
3. ✅ Check for console errors
4. ✅ Move to **MEGA PROMPT 2** (Applications Table View)

---

**This is the foundation. Once this is solid, the rest will flow smoothly!** 🚀
