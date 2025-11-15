# SIVIO PROJECT HANDOFF DOCUMENT
**Last Updated:** November 14, 2025
**Version:** 0.1.0
**Status:** Active Development - Part 2 In Progress

---

## TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Complete Tech Stack](#2-complete-tech-stack)
3. [Integrations & API Keys](#3-integrations--api-keys)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema](#5-database-schema)
6. [File Structure](#6-file-structure)
7. [Current Status](#7-current-status)
8. [Routing Structure](#8-routing-structure)
9. [Component Library](#9-component-library)
10. [Recent Changes](#10-recent-changes)
11. [Build & Deployment](#11-build--deployment)
12. [API Endpoints](#12-api-endpoints)
13. [Common Commands](#13-common-commands)
14. [Troubleshooting](#14-troubleshooting)
15. [Next Steps & Roadmap](#15-next-steps--roadmap)
16. [Business Context](#16-business-context)
17. [Code Conventions](#17-code-conventions)

---

## 1. PROJECT OVERVIEW

### What is Sivio?
Sivio is a SaaS platform that helps college students automate their internship and job application process. It combines AI-powered job matching, automated contact discovery, and personalized outreach to help students land interviews 10x faster.

### Who is it for?
**Primary Users:** College students (undergrad and graduate) actively seeking internships and entry-level positions

**Secondary Users (Future):** Universities and career centers managing student outcomes

### What problem does it solve?
Students waste 5+ hours daily on manual job applications with poor results:
- Manually filling repetitive forms
- 2% average response rate from applications
- No systematic way to track applications
- Lack of access to hiring manager contact information
- No strategy for follow-up or outreach

### Current Development Stage
**Phase:** Active Development - Part 2 of 5
- ✅ Part 1: Advanced interactive homepage with parallax effects, professional navigation, essential pages
- 🔄 Part 2: File hygiene, live site audit, bug fixes (IN PROGRESS)
- ⏳ Part 3: Advanced UI enhancements and micro-interactions
- ⏳ Part 4: Professional pages with conversion optimization
- ⏳ Part 5: Final polish and production launch

---

## 2. COMPLETE TECH STACK

### Frontend Framework
- **Next.js 16.0.1** (App Router, Server Components)
  - Using Turbopack for builds
  - React 19.2.0
  - TypeScript 5.x (strict mode)

### Styling
- **Tailwind CSS 4.x**
  - Custom configuration with gradient design system
  - Utility-first approach
  - PostCSS integration

### UI & Animation Libraries
- **Framer Motion 12.23.24** - Advanced animations (⚠️ Currently causing SSR issues)
- **Lucide React 0.553.0** - Icon library
- **React Intersection Observer 10.0.0** - Scroll-based animations

### Authentication
- **Clerk 6.34.6** - Complete auth solution
  - Social login (Google, GitHub)
  - User management
  - Webhooks for user sync
  - Middleware protection

### Database
- **Supabase**
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions (not yet implemented)
  - Storage (not yet used)

### Backend Services
- **Anthropic Claude API** - AI-powered contact reasoning and email generation
- **Apify** - LinkedIn job scraping via n8n workflows (NOT Snov.io!)
- **Apollo.io** - Email verification (referenced in code, integration pending)

### Deployment
- **Vercel**
  - Automatic deployments from GitHub main branch
  - Preview deployments for PRs
  - Environment variables managed in Vercel dashboard

### Development Tools
- **ESLint 9.x** - Code linting
- **TypeScript** - Type safety
- **tsx 4.20.6** - TypeScript execution
- **dotenv 17.2.3** - Environment variable management

### Package Manager
- **npm** (using package-lock.json)

---

## 3. INTEGRATIONS & API KEYS

### Active Integrations

#### 1. **Supabase** (Database)
- **Purpose:** Primary PostgreSQL database for all application data
- **Environment Variables:**
  - `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key (safe for client)
  - `SUPABASE_SERVICE_ROLE_KEY` - Admin key for server-side operations
- **Endpoint:** `https://[project-ref].supabase.co`
- **Tables:** jobs, saved_jobs, users, contacts, credit_usage_logs, cached_contacts
- **Features Used:** Database, RLS policies, triggers, JSONB columns

#### 2. **Clerk** (Authentication)
- **Purpose:** User authentication and management
- **Environment Variables:**
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Public key for client
  - `CLERK_SECRET_KEY` - Secret key for server
  - `CLERK_WEBHOOK_SECRET` - For webhook verification
- **Webhooks:** `/api/webhooks/clerk` syncs users to Supabase
- **Features Used:** Social login, user metadata, middleware protection
- **Docs:** https://clerk.com/docs

#### 3. **Anthropic Claude** (AI)
- **Purpose:** Contact reasoning, email generation, job matching intelligence
- **Environment Variable:** `ANTHROPIC_API_KEY`
- **SDK:** `@anthropic-ai/sdk` v0.68.0
- **Model:** Claude 3.5 Sonnet
- **Usage:** Contact finder modal, outreach email generation

#### 4. **Apify** (Job Scraping)
- **Purpose:** LinkedIn job scraping via n8n automation workflows
- **Setup:** Jobs flow through n8n → Apify → Supabase
- **Data Source:** LinkedIn job listings
- **Integration Point:** `/api/jobs/sync` endpoint receives data from n8n
- **Note:** This is the PRIMARY job data source (not Adzuna, not Snov.io)

#### 5. **Snov.io** (Contact Discovery) - DEPRECATED/UNUSED
- **Status:** ⚠️ Referenced in code but NOT actively used
- **Environment Variables:** `SNOV_USER_ID`, `SNOV_CLIENT_SECRET`
- **Note:** May be removed in cleanup phase
- **Alternative:** Using Apify for contact discovery instead

### Planned Integrations (Not Yet Implemented)
- **Apollo.io** - Email verification
- **SendGrid/Resend** - Transactional emails
- **Stripe** - Payment processing for paid tiers
- **Mixpanel/PostHog** - Analytics

---

## 4. ENVIRONMENT VARIABLES

### Required .env.local Template
```bash
# ============================================================================
# SIVIO ENVIRONMENT VARIABLES
# ============================================================================
# DO NOT commit this file to version control
# Copy this template and fill in your actual values
# ============================================================================

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Anthropic Claude (AI)
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Snov.io (DEPRECATED - may be removed)
SNOV_USER_ID=your_user_id
SNOV_CLIENT_SECRET=your_client_secret

# Cron Jobs (for scheduled tasks)
CRON_SECRET=your_random_secret_string_here

# ============================================================================
# OPTIONAL / FUTURE
# ============================================================================
# Apollo.io (Email Verification)
# APOLLO_API_KEY=your_apollo_key_here

# SendGrid (Transactional Email)
# SENDGRID_API_KEY=your_sendgrid_key_here

# Stripe (Payments)
# STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# Analytics
# NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here
```

### Environment-Specific Files
- `.env.local` - Local development (gitignored)
- `.env.production` - Production secrets (gitignored)
- Vercel Dashboard - Production environment variables

---

## 5. DATABASE SCHEMA

### Current Supabase Tables

#### `jobs` Table (Primary Job Listings)
```sql
CREATE TABLE jobs (
  -- Primary identifier
  job_id TEXT PRIMARY KEY,  -- LinkedIn job ID

  -- Core job information
  job_title TEXT NOT NULL,
  job_url TEXT NOT NULL UNIQUE,
  apply_url TEXT NOT NULL,
  job_description TEXT NOT NULL,
  job_description_raw_html TEXT,

  -- Company information
  company_name TEXT NOT NULL,
  company_url TEXT,
  company_logo_url TEXT,

  -- Job details
  location TEXT NOT NULL,
  employment_type TEXT,  -- "Full-time", "Internship", etc.
  seniority_level TEXT,   -- "Entry level", "Internship", etc.
  job_function TEXT,
  industries JSONB DEFAULT '[]'::jsonb,  -- Array of industries

  -- Salary and applicants
  salary_range TEXT,
  num_applicants TEXT,  -- "Over 200 applicants" (LinkedIn text format)

  -- Application metadata
  easy_apply BOOLEAN DEFAULT false,

  -- Timestamps
  time_posted TEXT,  -- "2 days ago", "1 week ago" (LinkedIn format)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_jobs_job_id` - Primary lookups
- `idx_jobs_company_name` - Company filtering
- `idx_jobs_location` - Location filtering
- `idx_jobs_employment_type` - Type filtering
- `idx_jobs_seniority_level` - Level filtering
- `idx_jobs_created_at` - Date sorting
- `idx_jobs_easy_apply` - Easy apply filtering
- `idx_jobs_industries` - GIN index for JSONB array searches
- `idx_jobs_location_type_created` - Composite for common queries

**Triggers:**
- `trigger_jobs_updated_at` - Auto-updates `updated_at` on row changes

#### `users` Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,  -- Sync with Clerk
  email TEXT,
  credits INTEGER DEFAULT 100,  -- Free tier credits
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Level Security:** Enabled
- Users can only read/update their own data

#### `saved_jobs` Table
```sql
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT REFERENCES jobs(job_id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, job_id)
);
```

**RLS:** Users can only see their own saved jobs

#### `contacts` Table (Contact Discovery)
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  company_name TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  linkedin_url TEXT,
  phone TEXT,
  relevance_score INTEGER,  -- 1-100
  source TEXT,  -- 'snov', 'apify', 'apollo', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `cached_contacts` Table (Performance Optimization)
```sql
CREATE TABLE cached_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL UNIQUE,
  contacts_data JSONB NOT NULL,  -- Cached contact results
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,  -- Cache expiration
  hit_count INTEGER DEFAULT 0
);
```

#### `credit_usage_logs` Table (Usage Tracking)
```sql
CREATE TABLE credit_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,  -- 'contact_search', 'auto_apply', etc.
  credits_used INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Views

#### `job_statistics` View
```sql
CREATE VIEW job_statistics AS
SELECT
  COUNT(*) as total_jobs,
  COUNT(DISTINCT company_name) as total_companies,
  COUNT(DISTINCT location) as total_locations,
  COUNT(*) FILTER (WHERE easy_apply = true) as easy_apply_jobs,
  COUNT(*) FILTER (WHERE employment_type = 'Full-time') as fulltime_jobs,
  COUNT(*) FILTER (WHERE employment_type = 'Internship') as internship_jobs,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as jobs_last_week,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as jobs_last_month
FROM jobs;
```

---

## 6. FILE STRUCTURE

```
sivio/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (marketing)/              # TODO: Group public pages
│   │   │   ├── page.tsx              # Homepage ✅
│   │   │   ├── about/                # About page ✅
│   │   │   ├── pricing/              # Pricing page ✅
│   │   │   ├── features/             # Features page ✅
│   │   │   ├── contact/              # Contact page ✅
│   │   │   ├── blog/                 # Blog page ✅
│   │   │   ├── help/                 # Help center ✅
│   │   │   └── changelog/            # Changelog page ✅
│   │   ├── (auth)/                   # TODO: Group auth pages
│   │   │   ├── sign-in/              # Clerk sign in ✅
│   │   │   └── sign-up/              # Clerk sign up ✅
│   │   ├── (dashboard)/              # TODO: Group protected pages
│   │   │   ├── dashboard/            # User dashboard ✅
│   │   │   ├── jobs/                 # Job browsing ✅ (404 on prod)
│   │   │   └── _crm/                 # CRM (disabled) ❌
│   │   ├── api/                      # API Routes
│   │   │   ├── admin/                # Admin endpoints
│   │   │   │   ├── cache-cleanup/
│   │   │   │   └── cache-stats/
│   │   │   ├── contacts/             # Contact discovery
│   │   │   │   ├── route.ts          # POST /api/contacts
│   │   │   │   └── search/           # POST /api/contacts/search
│   │   │   ├── jobs/                 # Job management
│   │   │   │   ├── [id]/             # GET /api/jobs/:id
│   │   │   │   ├── route.ts          # GET /api/jobs, POST /api/jobs
│   │   │   │   ├── saved/            # Saved jobs
│   │   │   │   └── sync/             # n8n webhook endpoint
│   │   │   ├── user/                 # User management
│   │   │   │   └── credits/          # GET /api/user/credits
│   │   │   ├── webhooks/             # External webhooks
│   │   │   │   └── clerk/            # Clerk user sync
│   │   │   └── test-*/               # Test endpoints (remove in prod)
│   │   ├── layout.tsx                # Root layout with Clerk
│   │   ├── globals.css               # Global styles
│   │   └── favicon.ico
│   ├── components/                   # React components
│   │   ├── ui/                       # TODO: Reusable UI components
│   │   ├── AnimatedButton.tsx        # ⚠️ SSR issue
│   │   ├── CountUpNumber.tsx         # ⚠️ SSR issue
│   │   ├── InteractiveCard.tsx       # ⚠️ SSR issue
│   │   ├── ParallaxSection.tsx       # ⚠️ SSR issue
│   │   ├── MainNav.tsx               # Professional navigation
│   │   ├── NavBar.tsx                # Simple nav bar
│   │   ├── JobCard.tsx               # Job listing card
│   │   ├── JobDataGrid.tsx           # Job grid view
│   │   ├── JobDetailModal.tsx        # Job details modal
│   │   ├── ContactCard.tsx           # Contact display
│   │   └── ContactFinderModal.tsx    # Contact search modal
│   ├── lib/                          # Utilities and libraries
│   │   ├── supabase/                 # Supabase clients
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── admin.ts              # Admin client
│   │   ├── utils/                    # Utility functions
│   │   │   └── domain-guesser.ts     # Extract domain from URL
│   │   └── services/                 # Business logic (to be created)
│   ├── hooks/                        # Custom React hooks
│   │   ├── useParallax.ts            # Parallax scroll effect
│   │   └── useTilt.ts                # 3D tilt effect
│   ├── types/                        # TypeScript definitions
│   │   ├── job.ts                    # Job-related types
│   │   ├── crm.ts                    # CRM types
│   │   └── database.ts               # Database types
│   └── middleware.ts                 # Clerk auth middleware
├── public/                           # Static assets
│   ├── next.svg
│   ├── vercel.svg
│   └── [other SVG icons]
├── docs/                             # Documentation (to be created)
│   └── SITE_AUDIT_REPORT.md          # Current audit
├── supabase/                         # Database migrations
│   └── migrations/
│       ├── create_caching_tables.sql
│       ├── 20250111_credit_usage_logs.sql
│       └── 20250111_allow_null_emails.sql
├── scripts/                          # Utility scripts
│   └── run-migration.js
├── backups/                          # Backup folder (gitignored)
├── *.sql                             # Schema migration files
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── eslint.config.mjs                 # ESLint configuration
└── README.md                         # Project README

Total Files:
- 65 TypeScript/TSX files
- 13 pages
- 11 components
- 16 API routes
```

---

## 7. CURRENT STATUS

### What's Working ✅

#### Homepage (`/`)
- ✅ Loads successfully
- ✅ New MainNav navigation with dropdowns
- ✅ Hero section with gradient text
- ✅ Social proof (university logos)
- ✅ Feature cards (⚠️ 3D effects not working due to SSR issue)
- ✅ Testimonials section
- ✅ CTA buttons
- ✅ Footer
- ⚠️ Animated stats (CountUpNumber not working due to SSR)

#### Authentication
- ✅ Clerk integration working
- ✅ Sign in page (`/sign-in`)
- ✅ Sign up page (`/sign-up`)
- ✅ User sync webhook (`/api/webhooks/clerk`)
- ✅ Middleware protecting routes

#### Database
- ✅ Supabase connection working
- ✅ Jobs table with Apify/LinkedIn schema
- ✅ Users table synced with Clerk
- ✅ Saved jobs functionality
- ✅ Contacts and caching tables
- ✅ RLS policies active

### What's Broken ❌

#### Build & Deployment (CRITICAL)
- ❌ **Build failing** during static generation
- ❌ Error: `TypeError: Cannot read properties of null (reading 'useContext')`
- ❌ Cause: Framer Motion SSR incompatibility with global-error page
- ❌ Impact: All new pages returning 404 on production

#### Pages (All 404 on Production)
- ❌ `/jobs` - Job browsing page
- ❌ `/features` - Features showcase
- ❌ `/pricing` - Pricing tiers
- ❌ `/about` - About page
- ❌ `/contact` - Contact form
- ❌ `/blog` - Blog page
- ❌ `/help` - Help center
- ❌ `/changelog` - Product updates

#### Features
- ❌ `/crm` - Completely disabled (in `_crm` folder)
- ⚠️ Interactive animations (parallax, tilt) not working due to SSR
- ⚠️ Animated number counters not working

### What's Partially Working ⚠️

#### Jobs Page (when build succeeds)
- File exists and is valid
- Database query works
- UI components render
- Filters and search implemented
- Job detail modal functional
- BUT: Not deployed due to build error

#### Dashboard Page
- ✅ Loads for authenticated users
- ✅ Displays user stats
- ✅ Navigation works
- ⚠️ Most stats are mock data
- ⚠️ No real application tracking yet

---

## 8. ROUTING STRUCTURE

### Public Routes (No Auth Required)
```typescript
// Marketing Pages
'/'                    // Homepage
'/about'               // About Sivio
'/pricing'             // Pricing tiers
'/features'            // Feature showcase
'/contact'             // Contact form
'/blog'                // Blog (placeholder)
'/help'                // Help center
'/changelog'           // Product updates

// Authentication
'/sign-in'             // Clerk sign in
'/sign-up'             // Clerk sign up
```

### Protected Routes (Auth Required)
```typescript
// User Dashboard
'/dashboard'           // Main dashboard
'/jobs'                // Job browsing (should be public?)
'/crm'                 // CRM (disabled)
```

### API Routes
```typescript
// Job Management
GET    /api/jobs                    // List jobs with filters
POST   /api/jobs                    // Create job (from n8n)
GET    /api/jobs/[id]               // Get single job
POST   /api/jobs/sync               // Webhook from n8n
GET    /api/jobs/saved              // User's saved jobs
POST   /api/jobs/saved              // Save a job

// Contact Discovery
POST   /api/contacts                // Find contacts for company
POST   /api/contacts/search         // Advanced contact search

// User Management
GET    /api/user/credits            // Get user credit balance

// Admin
GET    /api/admin/cache-stats       // Cache statistics
POST   /api/admin/cache-cleanup     // Clear expired cache

// Webhooks
POST   /api/webhooks/clerk          // Clerk user sync

// Test Endpoints (TODO: Remove in production)
GET    /api/test-*                  // Various test endpoints
```

### Dynamic Routes
```typescript
'/api/jobs/[id]'                    // Job detail by ID
'/sign-in/[[...sign-in]]'           // Clerk catch-all
'/sign-up/[[...sign-up]]'           // Clerk catch-all
```

---

## 9. COMPONENT LIBRARY

### Core Interactive Components

#### `AnimatedButton.tsx` ⚠️
**Status:** SSR Issue - Not working in production

```typescript
interface AnimatedButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  magnetic?: boolean      // Magnetic cursor effect
  ripple?: boolean        // Ripple click effect
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}
```

**Features:**
- Magnetic interaction on hover
- Ripple effect on click
- Gradient animations
- Multiple variants and sizes
- Can be button or Link

**Usage:**
```tsx
<AnimatedButton
  href="/sign-up"
  variant="gradient"
  size="lg"
  magnetic
  ripple
>
  Get Started
</AnimatedButton>
```

#### `InteractiveCard.tsx` ⚠️
**Status:** SSR Issue - Not working in production

```typescript
interface InteractiveCardProps {
  children: ReactNode
  className?: string
  tilt?: boolean          // 3D tilt on mouse move
  glow?: boolean          // Glow effect on hover
  flip?: boolean          // Card flip functionality
  frontContent?: ReactNode
  backContent?: ReactNode
  maxTilt?: number        // Max tilt angle (degrees)
  glareEffect?: boolean   // Glare overlay
  hoverScale?: number     // Scale on hover
}
```

**Features:**
- 3D tilt effect following mouse
- Glare overlay effect
- Optional flip animation
- Glow on hover
- Customizable tilt intensity

#### `ParallaxSection.tsx` ⚠️
**Status:** SSR Issue - Not working in production

```typescript
interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  intensity?: number      // Movement intensity (0-1)
  reverse?: boolean       // Reverse direction
  enableMouse?: boolean   // Mouse tracking
  enableScroll?: boolean  // Scroll tracking
  offset?: number         // Y-axis offset
}
```

**Features:**
- Mouse-based parallax
- Scroll-based parallax
- Configurable intensity
- Can reverse direction

#### `CountUpNumber.tsx` ⚠️
**Status:** SSR Issue - Not working in production

```typescript
interface CountUpNumberProps {
  value: number
  duration?: number       // Animation duration (ms)
  suffix?: string         // "+", "%", "K", etc.
  prefix?: string         // "$", etc.
  decimals?: number       // Decimal places
  className?: string
  startOnView?: boolean   // Trigger on scroll into view
}
```

**Features:**
- Animated counting
- Scroll-triggered start
- Easing function (easeOutCubic)
- Customizable formatting

### Navigation Components

#### `MainNav.tsx`
**Status:** ✅ Working

```typescript
// No props - fully self-contained
export default function MainNav()
```

**Features:**
- Dropdown menus (Product, Solutions, Resources)
- Mobile responsive
- Clerk UserButton integration
- Smooth animations
- Active state indicators

#### `NavBar.tsx`
**Status:** ✅ Working

```typescript
interface NavBarProps {
  activePage: 'dashboard' | 'jobs' | 'crm'
  showUserButton?: boolean
}
```

**Features:**
- Simpler alternative to MainNav
- Active page highlighting
- Client-side UserButton rendering

### Job Components

#### `JobCard.tsx`
**Status:** ✅ Working

```typescript
interface JobCardProps {
  job: Job | JobCardData
  onSave?: (jobId: string) => Promise<void>
  isSaved?: boolean
  onClick?: () => void
}
```

**Features:**
- Displays job listing
- Save/bookmark functionality
- Company logo
- Job metadata (location, type, etc.)
- Click to view details

#### `JobDetailModal.tsx`
**Status:** ✅ Working

```typescript
interface JobDetailModalProps {
  jobId: string | null
  isOpen: boolean
  onClose: () => void
  isSaved?: boolean
  onSave?: (jobId: string) => Promise<void>
}
```

**Features:**
- Full job details
- Save/bookmark
- Action buttons (Add to CRM, Auto-Apply, Find Contacts)
- External apply link
- Company information

#### `JobDataGrid.tsx`
**Status:** ✅ Working

```typescript
interface JobDataGridProps {
  jobs: Job[]
  onJobClick: (job: Job) => void
  savedJobIds?: Set<string>
  onSave?: (jobId: string) => Promise<void>
}
```

**Features:**
- Grid layout of job cards
- Click handlers
- Saved state tracking

### Contact Components

#### `ContactFinderModal.tsx`
**Status:** ✅ Working (with API integration)

```typescript
interface ContactFinderModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  companyName: string
  companyDomain: string
  jobTitle?: string
  jobDescription?: string
  jobType?: string
  location?: string
  userCredits: number
  onCreditsUpdate: (credits: number) => void
}
```

**Features:**
- Search for contacts at company
- Uses Anthropic Claude for reasoning
- Credit-based system
- Displays contact cards
- Email/LinkedIn information

#### `ContactCard.tsx`
**Status:** ✅ Working

```typescript
interface ContactCardProps {
  contact: {
    name: string
    title: string
    email?: string
    linkedin_url?: string
    relevance_score?: number
  }
}
```

**Features:**
- Display contact information
- Relevance score visualization
- Copy email button
- LinkedIn link

---

## 10. RECENT CHANGES

### Part 1 Additions (Completed)
**Date:** November 14, 2025

**Major Features Added:**
1. ✅ **Advanced Interactive Homepage**
   - Parallax scrolling system
   - 3D tilt effects on cards
   - Animated stat counters
   - Gradient design system

2. ✅ **Custom Hooks**
   - `useParallax.ts` - Mouse and scroll tracking
   - `useTilt.ts` - 3D card tilt effects

3. ✅ **Interactive Components**
   - `AnimatedButton.tsx` - Magnetic buttons with ripple
   - `InteractiveCard.tsx` - 3D tilt cards with glare
   - `ParallaxSection.tsx` - Parallax wrapper
   - `CountUpNumber.tsx` - Animated counters

4. ✅ **Professional Navigation**
   - `MainNav.tsx` - Dropdown navigation
   - Mobile responsive
   - User authentication integration

5. ✅ **Essential Pages** (7 new pages)
   - `/features` - Feature showcase
   - `/pricing` - Pricing tiers with FAQs
   - `/about` - Mission and values
   - `/contact` - Contact form
   - `/blog` - Blog placeholder
   - `/help` - Help center
   - `/changelog` - Product updates

6. ✅ **Dependencies Installed**
   - `framer-motion@12.23.24`
   - `react-intersection-observer@10.0.0`

### Part 2 Status (In Progress)
**Date:** November 14, 2025

**Completed:**
- ✅ Created backup branch: `backup-before-part2-cleanup`
- ✅ Created local backup: `../sivio-backups/sivio-backup-20251114-221021`
- ✅ Documented file structure
- ✅ Audited live site
- ✅ Created SITE_AUDIT_REPORT.md
- ✅ Identified critical build error

**In Progress:**
- 🔄 Fixing framer-motion SSR issues
- 🔄 Getting successful build
- 🔄 Deploying to production

**Not Started:**
- ⏳ File cleanup and organization
- ⏳ Removing unused code
- ⏳ Building onboarding flow
- ⏳ Final testing

### Known Issues from Latest Deployment

#### CRITICAL: Build Failure ❌
```
Error occurred prerendering page "/_global-error"
TypeError: Cannot read properties of null (reading 'useContext')
```

**Root Cause:** Framer Motion library trying to access React context during server-side rendering of the global error page.

**Impact:**
- All new pages (features, pricing, about, contact, blog, help, changelog, jobs) returning 404
- Only homepage and auth pages working
- Interactive animations not functional

**Attempted Fixes:**
1. Removed `global-error.tsx`
2. Removed `export const dynamic = 'force-dynamic'`
3. Added SSR safety checks to hooks (`typeof window === 'undefined'`)
4. Simplified Next.js config
5. Pushed to Vercel (waiting for build)

**Next Steps:**
- If Vercel build fails, temporarily remove framer-motion
- Deploy working site first
- Add animations back with lazy loading

### Backup Locations
- **Git Branch:** `backup-before-part2-cleanup` (pushed to GitHub)
- **Local Backup:** `../sivio-backups/sivio-backup-20251114-221021`
- **Last Working Commit:** `8154bdd` (before Part 2 changes)

---

## 11. BUILD & DEPLOYMENT

### Build Commands
```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Production Build
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint

# Type Checking (custom script needed)
npx tsc --noEmit         # Check TypeScript errors
```

### Development Environment
- **Node Version:** 20.x (check with `node --version`)
- **Package Manager:** npm
- **Build Tool:** Next.js 16 with Turbopack
- **Port:** 3000 (default)

### Vercel Configuration

#### Deployment Settings
- **Framework:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
- **Dev Command:** `npm run dev`

#### Git Integration
- **Repository:** `github.com/Ebailine/Sivio`
- **Production Branch:** `main`
- **Preview Branches:** All branches
- **Auto-deploy:** Enabled for `main` branch

#### Environment Variables (Set in Vercel Dashboard)
All variables from `.env.local` template must be added to:
**Vercel Dashboard → Settings → Environment Variables**

Separate configurations for:
- Production
- Preview
- Development

#### Build Settings
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  turbopack: {},  // Enable Turbopack
}
```

#### Ignored Build Step
Vercel runs build on every commit to `main`. To skip:
```bash
git commit -m "docs: update README [skip ci]"
```

### Current Build Status
- ❌ **Local Build:** Failing (framer-motion SSR error)
- ⏳ **Vercel Build:** Pending (deployed commit `1198b11`)
- ✅ **Last Successful Build:** Commit `7899093` (before Part 1)

### Build Optimization
- **Turbopack:** Enabled for faster builds
- **TypeScript:** Strict mode enabled
- **Code Splitting:** Automatic via Next.js
- **Image Optimization:** Next.js Image component
- **CSS:** Tailwind with PostCSS

---

## 12. API ENDPOINTS

### Job Management

#### `GET /api/jobs`
**Purpose:** List jobs with optional filters and pagination

**Auth Required:** No (public endpoint)

**Query Parameters:**
```typescript
{
  search?: string          // Search in title, company, description
  location?: string        // Filter by location
  employment_type?: string // "Full-time", "Internship", etc.
  seniority_level?: string // "Entry level", "Internship", etc.
  job_function?: string    // Job category
  industries?: string[]    // Industry filter (array)
  easy_apply?: boolean     // Filter easy apply jobs
  page?: number           // Page number (default: 1)
  limit?: number          // Results per page (default: 20)
}
```

**Response:**
```typescript
{
  jobs: Job[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### `POST /api/jobs`
**Purpose:** Create new job (from n8n workflow)

**Auth Required:** No (uses CRON_SECRET for verification)

**Headers:**
```typescript
{
  'Authorization': `Bearer ${CRON_SECRET}`
}
```

**Request Body:**
```typescript
{
  job_id: string,
  job_title: string,
  company_name: string,
  location: string,
  job_url: string,
  apply_url: string,
  job_description: string,
  employment_type?: string,
  salary_range?: string,
  // ... other job fields
}
```

#### `GET /api/jobs/[id]`
**Purpose:** Get single job by ID

**Auth Required:** No

**Response:**
```typescript
{
  job: Job
}
```

#### `POST /api/jobs/sync`
**Purpose:** Webhook endpoint for n8n to sync jobs

**Auth Required:** CRON_SECRET

**Request Body:** Batch of jobs from Apify

### Contact Discovery

#### `POST /api/contacts/search`
**Purpose:** Find contacts for a company using AI reasoning

**Auth Required:** Yes (Clerk)

**Request Body:**
```typescript
{
  companyName: string,
  companyDomain: string,
  jobTitle?: string,
  jobDescription?: string,
  jobType?: string,
  location?: string
}
```

**Response:**
```typescript
{
  contacts: Array<{
    name: string,
    title: string,
    email?: string,
    linkedin_url?: string,
    relevance_score: number
  }>,
  creditsUsed: number,
  remainingCredits: number
}
```

**Credits:** Costs 5 credits per search

### User Management

#### `GET /api/user/credits`
**Purpose:** Get current user's credit balance

**Auth Required:** Yes (Clerk)

**Response:**
```typescript
{
  credits: number,
  userId: string
}
```

### Admin Endpoints

#### `GET /api/admin/cache-stats`
**Purpose:** View contact cache statistics

**Auth Required:** Admin only (TODO: implement admin check)

**Response:**
```typescript
{
  total_cached: number,
  avg_hits: number,
  oldest_cache: string,
  newest_cache: string
}
```

#### `POST /api/admin/cache-cleanup`
**Purpose:** Clear expired cache entries

**Auth Required:** Admin only

**Response:**
```typescript
{
  deleted: number,
  message: string
}
```

### Webhooks

#### `POST /api/webhooks/clerk`
**Purpose:** Sync Clerk users to Supabase database

**Auth Required:** Webhook signature verification

**Clerk Events Handled:**
- `user.created` - Create user in Supabase
- `user.updated` - Update user in Supabase
- `user.deleted` - Delete user from Supabase

**Headers:**
```typescript
{
  'svix-id': string,
  'svix-timestamp': string,
  'svix-signature': string
}
```

---

## 13. COMMON COMMANDS

### Development Workflow
```bash
# Start development server
npm run dev

# Build for production (check for errors)
npm run build

# Type check without building
npx tsc --noEmit

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Install dependencies
npm install

# Add new dependency
npm install package-name

# Add dev dependency
npm install -D package-name
```

### Database Management
```bash
# Run migration locally (if using Supabase CLI)
supabase db push

# Generate TypeScript types from database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

# Reset local database (dev only)
supabase db reset
```

### Git Workflow
```bash
# Check current branch
git branch

# Create feature branch
git checkout -b feature/your-feature-name

# Stage changes
git add .

# Commit with message
git commit -m "feat: add new feature"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View recent commits
git log --oneline -10

# Create backup branch
git checkout -b backup-branch-name
```

### Vercel Deployment
```bash
# Deploy to production (via git push)
git push origin main

# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

### Testing & Debugging
```bash
# Test API endpoint locally
curl http://localhost:3000/api/jobs

# Test with JSON body
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"job_id":"test","job_title":"Test Job"}'

# Check for unused dependencies
npx depcheck

# Check bundle size
npm run build && npx @next/bundle-analyzer

# Find large files
find . -type f -size +1M -not -path "./node_modules/*"
```

### Cleanup Commands
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Clear all build artifacts
rm -rf .next node_modules .turbo

# Find and remove DS_Store files
find . -name ".DS_Store" -delete
```

---

## 14. TROUBLESHOOTING

### Common Build Errors

#### Error: "Cannot read properties of null (reading 'useContext')"
**Cause:** Framer Motion SSR issue with global error page

**Solution:**
```typescript
// 1. Remove global-error.tsx
rm src/app/global-error.tsx

// 2. Add SSR checks to hooks
useEffect(() => {
  if (typeof window === 'undefined') return
  // ... hook logic
}, [])

// 3. Consider lazy loading framer-motion
const motion = dynamic(() => import('framer-motion'), { ssr: false })
```

#### Error: "Module not found: Can't resolve '@/...'"
**Cause:** TypeScript path alias not configured

**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Error: "Turbopack webpack config error"
**Cause:** Mixing webpack config with Turbopack

**Solution:**
```typescript
// next.config.ts - Remove webpack config or add:
export default {
  turbopack: {},  // Empty config to acknowledge Turbopack
}
```

### Clerk Authentication Issues

#### Error: "Publishable key not valid"
**Cause:** Missing or incorrect Clerk environment variables

**Solution:**
```bash
# Check .env.local has:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Restart dev server after adding
npm run dev
```

#### Error: "UserButton not rendering"
**Cause:** SSR issue with UserButton component

**Solution:**
```typescript
// Use client-side only rendering
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

return mounted ? <UserButton /> : null
```

### Supabase Connection Issues

#### Error: "Failed to fetch from Supabase"
**Cause:** Incorrect Supabase URL or missing RLS policy

**Solutions:**
```typescript
// 1. Verify environment variables
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

// 2. Check RLS policies in Supabase dashboard
// Security → Policies

// 3. Use service role for admin operations
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()
```

#### Error: "Row Level Security policy violation"
**Cause:** User doesn't have permission to access data

**Solutions:**
```sql
-- Grant public read access to jobs table
CREATE POLICY "Public jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

-- Grant users access to their own data
CREATE POLICY "Users can view own data"
  ON saved_jobs FOR SELECT
  USING (auth.uid() = user_id);
```

### Vercel Deployment Failures

#### Error: "Build exceeded maximum duration"
**Cause:** Build taking too long (10 min limit on free tier)

**Solutions:**
```bash
# 1. Reduce bundle size
npm run build  # Check build output size

# 2. Remove unused dependencies
npx depcheck

# 3. Upgrade Vercel plan (if needed)
```

#### Error: "Environment variable not found"
**Cause:** Missing environment variables in Vercel dashboard

**Solution:**
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add all variables from `.env.local`
4. Redeploy

### Performance Issues

#### Slow Page Load
**Diagnosis:**
```typescript
// Add performance monitoring
const Start = performance.now()
// ... code
console.log(`Took ${performance.now() - start}ms`)
```

**Solutions:**
- Enable Next.js Image optimization
- Lazy load heavy components
- Implement code splitting
- Add loading states

#### Database Query Slow
**Solutions:**
```sql
-- Add indexes
CREATE INDEX idx_table_column ON table(column);

-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM jobs WHERE location = 'New York';

-- Limit results
SELECT * FROM jobs LIMIT 20;
```

---

## 15. NEXT STEPS & ROADMAP

### Immediate Priorities (Part 2)

#### 🚨 CRITICAL - Fix Build Error
1. Get successful build locally
2. Deploy to production
3. Verify all pages accessible
4. Test interactive features

#### File Hygiene
1. Run file audit script
2. Remove unused files:
   - Old test endpoints
   - Snov.io integration code
   - Duplicate components
3. Organize into route groups:
   - `(marketing)` - Public pages
   - `(auth)` - Sign in/up
   - `(dashboard)` - Protected pages
4. Clean up `*.sql` files into migrations folder

#### Documentation
1. Complete this handoff document
2. Add JSDoc comments to all functions
3. Create API documentation
4. Write developer onboarding guide

### Part 3: Advanced UI Enhancements
**Goal:** Polish the user experience

1. **Micro-Interactions**
   - Button hover states
   - Loading spinners
   - Success/error toasts
   - Smooth transitions

2. **Advanced Animations**
   - Page transitions
   - Scroll-triggered reveals
   - Card entrance animations
   - Skeleton loaders

3. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - Focus indicators
   - ARIA labels

4. **Mobile Optimization**
   - Touch-friendly buttons
   - Responsive images
   - Mobile navigation
   - Performance optimization

### Part 4: Professional Pages & Conversion
**Goal:** Convert visitors to users

1. **Pricing Page Optimization**
   - Add comparison table
   - Add FAQ section
   - Implement "popular" badge
   - Add testimonials

2. **Features Page Enhancement**
   - Add demo videos/GIFs
   - Interactive feature demos
   - Use case examples
   - Comparison with competitors

3. **Blog System**
   - Markdown-based blog
   - SEO optimization
   - Categories and tags
   - Related posts

4. **Landing Page Optimization**
   - A/B testing setup
   - Analytics integration
   - Conversion tracking
   - Social proof widgets

### Part 5: Production Launch
**Goal:** Ship to real users

1. **Testing**
   - Unit tests (Jest + React Testing Library)
   - E2E tests (Playwright)
   - Load testing
   - Security audit

2. **Monitoring**
   - Error tracking (Sentry)
   - Analytics (Mixpanel)
   - Performance monitoring
   - Uptime monitoring

3. **Legal & Compliance**
   - Terms of Service
   - Privacy Policy
   - Cookie consent
   - GDPR compliance

4. **Marketing Launch**
   - Product Hunt launch
   - Social media campaign
   - Email to waitlist
   - University partnerships

### Future Features (Post-Launch)

#### Phase 1: Core Automation
- Auto-apply functionality
- Email outreach automation
- Interview scheduling
- Application tracking

#### Phase 2: Advanced CRM
- Re-enable CRM page
- Pipeline visualization
- Contact management
- Outreach analytics

#### Phase 3: AI Features
- Resume optimization
- Cover letter generation
- Interview prep AI
- Job match scoring

#### Phase 4: Enterprise
- University partnerships
- Team accounts
- Admin dashboard
- Custom branding

#### Phase 5: Monetization
- Stripe integration
- Subscription tiers
- Usage tracking
- Billing portal

---

## 16. BUSINESS CONTEXT

### Target Users

#### Primary: College Students
**Demographics:**
- Undergraduate students (junior/senior)
- Graduate students (master's programs)
- Recent graduates (<1 year out)
- Ages: 20-26
- Tech-savvy, mobile-first

**Pain Points:**
- Spending 5+ hours daily on applications
- Low response rates (2% average)
- Don't know how to network
- Overwhelmed by job search
- No connections at target companies
- Poor application tracking

**Motivations:**
- Land prestigious internship
- Break into competitive industries
- Higher salary offers
- Multiple interview opportunities
- Career advancement

#### Secondary: Career Centers
**Future B2B opportunity:**
- University career services
- Bootcamp placement teams
- Recruitment agencies

### Value Proposition

**For Students:**
"Land your dream internship 10x faster with AI-powered automation. While other students spend hours on applications, you're getting interviews."

**Key Benefits:**
1. **Time Savings:** 5+ hours saved weekly
2. **Better Results:** 85% interview rate vs. 2% average
3. **Higher Quality:** Direct contact with hiring managers
4. **Organization:** All applications tracked in one place
5. **Intelligence:** AI matches you with perfect-fit roles

### Pricing Model (Designed)

#### Free Tier
- 10 auto-applies per month
- 5 contact searches
- Basic job matching
- Application tracking
- **Target:** Hook users, demonstrate value

#### Pro Tier ($29/month)
- 500 auto-applies per month
- 100 contact searches
- AI job matching
- Outreach automation (50 emails/month)
- Full CRM access
- Priority support
- **Target:** Serious job seekers

#### Enterprise (Custom Pricing)
- Unlimited everything
- Team collaboration
- Dedicated support
- Custom integrations
- White-label options
- **Target:** Universities, bootcamps

### Competitor Analysis

#### Competing Solutions
1. **Indeed/LinkedIn**
   - Pros: Large job database
   - Cons: Manual application process, low response rates
   - Differentiation: We automate + add networking

2. **WayUp/Handshake**
   - Pros: Student-focused
   - Cons: Still manual, no automation
   - Differentiation: AI automation + contact finder

3. **Simplify (simplify.jobs)**
   - Pros: Auto-apply feature
   - Cons: No contact finding, no outreach
   - Differentiation: We add networking layer

4. **Apollo.io/Outreach.io**
   - Pros: Great for sales outreach
   - Cons: Not job-search specific, expensive
   - Differentiation: Student-focused, affordable

### Unique Selling Points

1. **AI Contact Reasoning**
   - Not just scraping - intelligent matching
   - Finds best person to contact
   - Explains why each contact matters

2. **Full Automation**
   - Auto-apply + contact finding + outreach
   - End-to-end workflow
   - Save 90%+ of time

3. **Student-Friendly Pricing**
   - Free tier to get started
   - Affordable pro tier
   - ROI in first internship

4. **Modern UX**
   - Beautiful, intuitive interface
   - Mobile-responsive
   - Fast and reliable

### Go-to-Market Strategy

#### Phase 1: Campus Ambassadors
- Recruit at top universities
- Word-of-mouth growth
- Student testimonials

#### Phase 2: Content Marketing
- Blog about job search tips
- SEO for "internship application"
- YouTube tutorials

#### Phase 3: University Partnerships
- Partner with career centers
- Bulk licensing
- Integration with Handshake

#### Phase 4: Paid Acquisition
- Google Ads (internship keywords)
- LinkedIn Ads (targeting students)
- TikTok/Instagram ads

---

## 17. CODE CONVENTIONS

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,           // Strict type checking
    "noImplicitAny": true,    // Require explicit types
    "strictNullChecks": true  // Null safety
  }
}
```

**Rules:**
- Use explicit types for all function parameters
- Use interfaces over types when possible
- No `any` types (use `unknown` if needed)
- Export types from central files

### Naming Conventions

#### Files
```
PascalCase.tsx       # React components
camelCase.ts         # Utilities, services
kebab-case.sql       # Database migrations
SCREAMING_SNAKE.md   # Documentation
```

#### Variables & Functions
```typescript
// camelCase for variables and functions
const userId = '123'
function getUserById(id: string) {}

// PascalCase for components and types
interface UserProfile {}
function ProfileCard() {}

// SCREAMING_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRIES = 3
```

#### Components
```typescript
// Named exports for utilities
export function formatDate() {}

// Default exports for pages/components
export default function HomePage() {}
```

### File Organization

#### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import type { User } from '@/types/user'

// 2. Types/Interfaces
interface ComponentProps {
  user: User
}

// 3. Component
export default function Component({ user }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState()

  // 3b. Event handlers
  const handleClick = () => {}

  // 3c. Render
  return <div>...</div>
}
```

#### API Route Structure
```typescript
// 1. Imports
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// 2. Types
interface RequestBody {
  // ...
}

// 3. Helper functions
async function helper() {}

// 4. Route handlers
export async function GET(request: NextRequest) {
  // GET logic
}

export async function POST(request: NextRequest) {
  // POST logic
}
```

### State Management Approach

**Current:**
- Local state with `useState`
- URL state with searchParams
- Server state with Server Components

**Future:**
- Consider Zustand for global state
- TanStack Query for server state
- Context for theme/auth

### Component Patterns

#### Client vs Server Components
```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetch()
  return <div>{data}</div>
}

// Client Component (interactive)
'use client'
export default function Interactive() {
  const [state, setState] = useState()
  return <button onClick={() => setState()}>Click</button>
}
```

#### Error Handling
```typescript
// API Routes
try {
  const result = await operation()
  return NextResponse.json({ success: true, data: result })
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  )
}

// Components
const [error, setError] = useState<string | null>(null)

try {
  await operation()
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error')
}
```

#### Loading States
```typescript
const [loading, setLoading] = useState(false)

const handleSubmit = async () => {
  setLoading(true)
  try {
    await operation()
  } finally {
    setLoading(false)
  }
}

return (
  <button disabled={loading}>
    {loading ? 'Loading...' : 'Submit'}
  </button>
)
```

### CSS/Styling Patterns

#### Tailwind Classes
```typescript
// Group related utilities
<div className="
  flex items-center justify-between    // Layout
  px-4 py-2                             // Spacing
  bg-blue-600 text-white               // Colors
  rounded-lg shadow-sm                 // Borders & shadows
  hover:bg-blue-700                    // Interactive
  transition-all duration-200          // Animation
">
```

#### Conditional Classes
```typescript
// Use template literals
<div className={`
  base-class
  ${active ? 'active-class' : 'inactive-class'}
  ${error && 'error-class'}
`}>

// Or use clsx library (if added)
import clsx from 'clsx'
<div className={clsx(
  'base-class',
  active && 'active-class',
  error && 'error-class'
)}>
```

### Comments & Documentation

#### JSDoc for Functions
```typescript
/**
 * Fetches a user by their ID from the database
 * @param userId - The unique identifier for the user
 * @returns The user object or null if not found
 * @throws {Error} If the database connection fails
 */
async function getUserById(userId: string): Promise<User | null> {
  // Implementation
}
```

#### Inline Comments
```typescript
// Explain WHY, not WHAT
// Good:
// Use service role to bypass RLS for admin operations
const supabase = createAdminClient()

// Bad:
// Create admin client
const supabase = createAdminClient()
```

#### TODO Comments
```typescript
// TODO: Implement pagination
// FIXME: Race condition when user clicks twice
// HACK: Temporary workaround for Clerk SSR issue
// NOTE: This assumes user is authenticated
```

---

## APPENDIX

### Useful Links
- **Repository:** https://github.com/Ebailine/Sivio
- **Live Site:** https://sivio.vercel.app
- **Vercel Dashboard:** https://vercel.com/ethns-projects-bc2e7e9b/sivio
- **Supabase Dashboard:** https://supabase.com/dashboard/project/[project-id]
- **Clerk Dashboard:** https://dashboard.clerk.com

### Emergency Contacts
- **Developer:** Ethan Bailine
- **Backup Branch:** `backup-before-part2-cleanup`
- **Last Known Good Commit:** `7899093`

### Quick Reference

#### Get Current Status
```bash
git status
git log --oneline -5
npm run build 2>&1 | tail -20
```

#### Restore from Backup
```bash
git checkout backup-before-part2-cleanup
# Or restore from local backup
cp -r ../sivio-backups/sivio-backup-20251114-221021/* .
```

#### Emergency Database Rollback
```sql
-- Supabase Dashboard → SQL Editor
-- Restore from backup or run migration again
```

---

**END OF HANDOFF DOCUMENT**

Last Updated: November 14, 2025
Version: 1.0.0
Status: Active Development - Part 2
