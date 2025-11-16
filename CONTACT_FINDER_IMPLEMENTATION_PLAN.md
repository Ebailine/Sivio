# 🎯 CONTACT FINDER - COMPLETE IMPLEMENTATION PLAN

**Created**: November 15, 2025
**Goal**: Build end-to-end contact finder system from CRM → n8n → Supabase → CRM
**Estimated Time**: 15-20 hours total

---

## 📋 TABLE OF CONTENTS

1. [Overview & Architecture](#overview--architecture)
2. [Phase 1: CRM UI Updates](#phase-1-crm-ui-updates)
3. [Phase 2: Contact Finder Modal](#phase-2-contact-finder-modal)
4. [Phase 3: API Endpoints](#phase-3-api-endpoints)
5. [Phase 4: n8n Workflow](#phase-4-n8n-workflow)
6. [Phase 5: Integration & Testing](#phase-5-integration--testing)

---

## 🏗️ OVERVIEW & ARCHITECTURE

### User Flow
```
1. User applies to jobs → Jobs in CRM "Applied" column
2. User selects jobs via checkboxes (table view)
3. Clicks "Contact Finder" button
4. Modal opens → User selects # of contacts (1-10, recommend 3-5)
5. User clicks "Run" → Triggers webhook
6. Webhook sends job data to n8n
7. n8n runs Apify → Gets HR + Team contacts
8. n8n scrapes LinkedIn profiles
9. n8n filters & AI ranks best contacts
10. Apollo verifies emails
11. Checks for duplicates in Supabase
12. Pushes final contacts to Supabase
13. CRM updates with new contacts
14. User sees results in CRM
```

### System Architecture
```
┌─────────────┐
│   CRM UI    │ (user selects jobs)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Contact Modal│ (select # contacts, click Run)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API: Trigger│ POST /api/contact-finder/trigger
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  n8n Flow   │ (webhook receives job data)
└──────┬──────┘
       │
   ┌───┴────────────────────────┐
   │                            │
   ▼                            ▼
┌─────────┐            ┌─────────────┐
│ Supabase│            │   Apify     │
│ (match  │            │ (scrape HR  │
│  jobs)  │            │  + team)    │
└────┬────┘            └──────┬──────┘
     │                        │
     └────────┬───────────────┘
              │
              ▼
       ┌─────────────┐
       │Apify Profile│
       │   Scraper   │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │ Filter &    │
       │ AI Rank     │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │   Apollo    │
       │  Verify     │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │Check Dupes  │
       │ (Supabase)  │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │Push to      │
       │ Supabase    │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │  CRM UI     │ (shows results)
       └─────────────┘
```

---

## 🎨 PHASE 1: CRM UI UPDATES

**Time**: 3-4 hours

### Task 1.1: Convert CRM to Table View with Checkboxes
**File**: `src/app/crm/page.tsx`

**Changes**:
1. Add view toggle (Kanban / Table)
2. Create table view component
3. Add checkbox column
4. Add "Contact Finder" button (disabled until jobs selected)
5. Track selected job IDs in state

**Table Columns**:
- [ ] Checkbox
- Company
- Position
- Location
- Date Applied
- Status (Applied/Interviewing/Offer/etc.)
- Actions (View, Edit, Delete)

**UI Design**:
```tsx
// Top bar
[Kanban View] [Table View] ← Toggle buttons

// When in Table View + jobs selected
[✓ 3 jobs selected]  [Contact Finder] ← Button

// Table
┌───┬──────────┬─────────────┬──────────┬─────────────┬──────────┐
│ □ │ Company  │ Position    │ Location │ Date Applied│ Status   │
├───┼──────────┼─────────────┼──────────┼─────────────┼──────────┤
│ ☑ │ Google   │ SWE Intern  │ SF, CA   │ Nov 10      │ Applied  │
│ □ │ Meta     │ PM Intern   │ NYC, NY  │ Nov 12      │ Applied  │
│ ☑ │ Apple    │ Design Int. │ Cupertino│ Nov 14      │ Applied  │
└───┴──────────┴─────────────┴──────────┴─────────────┴──────────┘
```

**State Management**:
```tsx
const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])

const handleSelectJob = (jobId: string) => {
  setSelectedJobIds(prev =>
    prev.includes(jobId)
      ? prev.filter(id => id !== jobId)
      : [...prev, jobId]
  )
}
```

---

### Task 1.2: Create Contact Finder Button
**File**: `src/app/crm/page.tsx`

**Requirements**:
- Only visible in table view
- Disabled when no jobs selected
- Shows count of selected jobs
- Professional design matching Sivio style
- Opens modal on click

**Code**:
```tsx
{viewMode === 'table' && (
  <button
    disabled={selectedJobIds.length === 0}
    onClick={() => setContactFinderOpen(true)}
    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
  >
    <Users size={20} className="inline mr-2" />
    Contact Finder {selectedJobIds.length > 0 && `(${selectedJobIds.length})`}
  </button>
)}
```

---

## 🔍 PHASE 2: CONTACT FINDER MODAL

**Time**: 4-5 hours

### Task 2.1: Create ContactFinderModal Component
**File**: `src/components/contact-finder/ContactFinderModal.tsx`

**Features**:
1. Display selected jobs (company, position)
2. Input for # of contacts (1-10)
3. Recommendation text (3-5 for best results)
4. Credit cost calculator
5. Run button (disabled until # selected)
6. Loading state during processing
7. Success/error states

**UI Layout**:
```
┌─────────────────────────────────────────────┐
│  🎯 Contact Finder                      [X] │
├─────────────────────────────────────────────┤
│                                             │
│  Selected Jobs (3):                         │
│  ┌─────────────────────────────────────┐   │
│  │ ✓ Google - Software Engineer Intern │   │
│  │ ✓ Meta - Product Manager Intern     │   │
│  │ ✓ Apple - Design Intern              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  How many contacts per job?                 │
│  ┌───────────────────────────────────┐     │
│  │  [  5  ]  contacts                │     │
│  └───────────────────────────────────┘     │
│                                             │
│  💡 We recommend 3-5 for best results       │
│                                             │
│  Credit Cost:                               │
│  • 3 jobs × 5 contacts = 15 contacts       │
│  • Cost: 15 credits                         │
│  • You have: 100 credits                    │
│                                             │
│  [ Cancel ]           [ Run Contact Finder ]│
│                                             │
└─────────────────────────────────────────────┘
```

**State Management**:
```tsx
interface ContactFinderModalProps {
  isOpen: boolean
  onClose: () => void
  selectedJobs: Application[]
  onSuccess: () => void
}

const [contactsPerJob, setContactsPerJob] = useState(3)
const [isRunning, setIsRunning] = useState(false)
const [error, setError] = useState<string | null>(null)

const totalContacts = selectedJobs.length * contactsPerJob
const creditCost = totalContacts
```

---

### Task 2.2: Add Validation & Error Handling
**File**: `src/components/contact-finder/ContactFinderModal.tsx`

**Validations**:
1. User has enough credits
2. Contacts per job between 1-10
3. At least 1 job selected
4. User is authenticated

**Error States**:
- Insufficient credits → Show upgrade prompt
- No jobs selected → Disable Run button
- Network error → Show retry option
- n8n webhook timeout → Show status message

---

## 🔌 PHASE 3: API ENDPOINTS

**Time**: 3-4 hours

### Task 3.1: Create Trigger Endpoint
**File**: `src/app/api/contact-finder/trigger/route.ts`

**Purpose**: Receives request from frontend, fetches job data, triggers n8n webhook

**Input**:
```json
{
  "jobIds": ["uuid1", "uuid2", "uuid3"],
  "contactsPerJob": 5
}
```

**Process**:
1. Authenticate user
2. Validate credits
3. Fetch full job data from Supabase (by jobIds)
4. Format data for n8n
5. Call n8n webhook
6. Deduct credits (hold)
7. Return status

**Output**:
```json
{
  "success": true,
  "runId": "n8n-run-uuid",
  "jobsProcessing": 3,
  "estimatedTime": "5-10 minutes",
  "creditsReserved": 15
}
```

**Code Structure**:
```typescript
export async function POST(request: Request) {
  // 1. Auth
  const { userId } = await auth()
  if (!userId) return unauthorized()

  // 2. Parse body
  const { jobIds, contactsPerJob } = await request.json()

  // 3. Validate
  if (contactsPerJob < 1 || contactsPerJob > 10) return badRequest()

  // 4. Get user
  const supabase = createAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  // 5. Check credits
  const totalCost = jobIds.length * contactsPerJob
  if (user.credits < totalCost) {
    return NextResponse.json({
      error: 'Insufficient credits',
      required: totalCost,
      available: user.credits
    }, { status: 402 })
  }

  // 6. Fetch jobs
  const { data: jobs } = await supabase
    .from('applications')
    .select('*, jobs(*)')
    .in('id', jobIds)
    .eq('user_id', user.id)

  // 7. Format for n8n
  const n8nPayload = {
    userId: user.id,
    contactsPerJob,
    jobs: jobs.map(app => ({
      jobId: app.job_id,
      applicationId: app.id,
      company: app.jobs.company,
      position: app.jobs.title,
      location: app.jobs.location,
      description: app.jobs.description,
      url: app.jobs.url,
      domain: extractDomain(app.jobs.company_url),
    }))
  }

  // 8. Call n8n webhook
  const n8nResponse = await fetch(process.env.N8N_CONTACT_FINDER_WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    },
    body: JSON.stringify(n8nPayload)
  })

  // 9. Reserve credits (create transaction with "pending" status)
  await supabase.from('credit_transactions').insert({
    user_id: user.id,
    amount: -totalCost,
    type: 'contact_finder',
    status: 'pending',
    description: `Contact finder for ${jobs.length} jobs (${contactsPerJob} contacts each)`,
    metadata: { jobIds, n8nRunId: n8nResponse.headers.get('x-run-id') }
  })

  return NextResponse.json({
    success: true,
    runId: n8nResponse.headers.get('x-run-id'),
    jobsProcessing: jobs.length,
    creditsReserved: totalCost
  })
}
```

---

### Task 3.2: Create Status Endpoint (Optional)
**File**: `src/app/api/contact-finder/status/[runId]/route.ts`

**Purpose**: Check progress of n8n workflow

**Output**:
```json
{
  "status": "running" | "completed" | "failed",
  "progress": {
    "jobsProcessed": 2,
    "jobsTotal": 3,
    "contactsFound": 10
  }
}
```

---

### Task 3.3: Update Webhook Receiver
**File**: `src/app/api/contacts/webhook/route.ts` (already exists!)

**Updates Needed**:
1. Accept `applicationId` in payload
2. Link contacts to specific applications
3. Update credit transaction status (pending → completed)
4. Send real-time update to user (optional: websocket/polling)

**Updated Payload**:
```json
{
  "userId": "uuid",
  "applicationId": "uuid",  // ← NEW
  "contacts": [
    {
      "email": "recruiter@company.com",
      "name": "Jane Smith",
      "position": "Senior Recruiter",
      "company": "Google",
      "verified": true,
      "relevance_score": 95,
      "linkedin_url": "...",
      "source": "apify_linkedin"
    }
  ]
}
```

---

## ⚙️ PHASE 4: N8N WORKFLOW

**Time**: 5-6 hours

### n8n Flow Architecture

```
┌──────────────┐
│   Webhook    │ (receives job data from Sivio)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Loop Over   │ (for each job)
│     Jobs     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Supabase    │ (match job_id, get full data)
│  Get Job     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Apify      │ (LinkedIn People Search)
│  HR + Team   │ Search for:
│   Search     │ - "Company HR recruiter Location"
└──────┬───────┘ - "Company Position Team Location"
       │
       ▼
┌──────────────┐
│  Extract     │ (parse Apify results)
│    Info      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Filter     │ (remove generic, keep relevant)
│  Contacts    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Apify      │ (LinkedIn Profile Scraper)
│  Profile     │ (get full profiles)
│  Scraper     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Merge     │ (combine search + profile data)
│     Data     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  AI Rank     │ (Claude/OpenAI)
│  Contacts    │ Rank by:
│              │ - Job relevance
└──────┬───────┘ - Location match
       │         - Role match
       │         - Seniority
       ▼
┌──────────────┐
│   Select     │ (take top N per contactsPerJob)
│   Top N      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Apollo     │ (verify emails)
│  Verify      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Supabase    │ (check for duplicates)
│ Check Dupes  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Google Sheet │ (log results)
│    Output    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Supabase    │ (push final contacts)
│ Push Contacts│ POST /api/contacts/webhook
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Update     │ (mark transaction complete)
│   Credits    │
└──────────────┘
```

---

### Node Details

#### Node 1: Webhook
**Type**: Webhook Trigger
**Method**: POST
**Path**: `/contact-finder`

**Receives**:
```json
{
  "userId": "uuid",
  "contactsPerJob": 5,
  "jobs": [
    {
      "jobId": "uuid",
      "applicationId": "uuid",
      "company": "Google",
      "position": "Software Engineer Intern",
      "location": "Mountain View, CA",
      "description": "...",
      "url": "https://...",
      "domain": "google.com"
    }
  ]
}
```

---

#### Node 2: Loop Over Jobs
**Type**: Loop
**Mode**: For Each Item
**Input**: `{{ $json.jobs }}`

---

#### Node 3: Apify HR + Team Search
**Type**: HTTP Request
**Method**: POST
**URL**: `https://api.apify.com/v2/acts/ACTOR_ID/run-sync-get-dataset-items`

**Body**:
```json
{
  "searches": [
    {
      "keywords": "{{ $json.company }} HR recruiter {{ $json.location }}",
      "filters": {
        "location": "{{ $json.location }}"
      }
    },
    {
      "keywords": "{{ $json.company }} {{ $json.position }} {{ $json.location }}",
      "filters": {
        "location": "{{ $json.location }}"
      }
    }
  ]
}
```

**Output**: List of LinkedIn profiles (names, titles, locations, profile URLs)

---

#### Node 4: Filter Contacts
**Type**: Filter
**Conditions**:
- Location matches job location (or nearby)
- Title contains HR/recruiter/talent OR position keywords
- Not generic (exclude "info@", "support@", etc.)
- Company matches

---

#### Node 5: Apify Profile Scraper
**Type**: HTTP Request
**Method**: POST
**URL**: `https://api.apify.com/v2/acts/dev_fusion~linkedin-profile-scraper/run-sync-get-dataset-items`

**Body**:
```json
{
  "profileUrls": [
    "{{ $json.linkedinUrl }}"
  ]
}
```

**Output**: Full profile data (education, experience, skills, etc.)

---

#### Node 6: AI Ranking
**Type**: OpenAI / Claude
**Prompt**:
```
You are a contact relevance ranker for job applications.

Job Details:
- Company: {{ $json.company }}
- Position: {{ $json.position }}
- Location: {{ $json.location }}
- Description: {{ $json.description }}

Contacts Found:
{{ $json.contacts }}

Rank each contact by relevance (0-100) based on:
1. Role match (HR/recruiter = high, team member = medium)
2. Location match (same city = high, same state = medium)
3. Seniority (manager+ = high)
4. Department match

Output JSON:
{
  "contacts": [
    {
      "name": "...",
      "email": "...",
      "relevance_score": 95,
      "reasoning": "Senior recruiter in same office"
    }
  ]
}
```

---

#### Node 7: Select Top N
**Type**: Code
**Function**:
```javascript
// Sort by relevance_score descending
const sorted = $input.all().sort((a, b) =>
  b.json.relevance_score - a.json.relevance_score
)

// Take top N (from contactsPerJob)
const topN = sorted.slice(0, $node["Webhook"].json.contactsPerJob)

return topN
```

---

#### Node 8: Apollo Verify
**Type**: HTTP Request
**Method**: POST
**URL**: Apollo API endpoint
**Body**:
```json
{
  "emails": ["{{ $json.email }}"]
}
```

**Output**: Verification status (valid/invalid/catch-all)

---

#### Node 9: Supabase Check Duplicates
**Type**: Supabase
**Operation**: SELECT
**Table**: contacts
**Filter**:
- `user_id = {{ $json.userId }}`
- `email IN ({{ emails }})`

**Output**: Existing contacts (to skip)

---

#### Node 10: Google Sheets Output
**Type**: Google Sheets
**Operation**: Append
**Sheet**: Contact Finder Results

**Columns**:
- Run ID
- User ID
- Job Company
- Job Position
- Contact Name
- Contact Email
- Contact Position
- Relevance Score
- Verified
- Timestamp

---

#### Node 11: Push to Supabase
**Type**: HTTP Request
**Method**: POST
**URL**: `https://sivio.vercel.app/api/contacts/webhook`
**Headers**:
```
Authorization: Bearer {{ $env.CRON_SECRET }}
Content-Type: application/json
```

**Body**:
```json
{
  "userId": "{{ $json.userId }}",
  "applicationId": "{{ $json.applicationId }}",
  "contacts": [
    {
      "email": "{{ $json.email }}",
      "name": "{{ $json.name }}",
      "position": "{{ $json.position }}",
      "company": "{{ $json.company }}",
      "verified": {{ $json.verified }},
      "relevance_score": {{ $json.relevance_score }},
      "linkedin_url": "{{ $json.linkedinUrl }}",
      "source": "apify_linkedin"
    }
  ]
}
```

---

## 🧪 PHASE 5: INTEGRATION & TESTING

**Time**: 2-3 hours

### Task 5.1: End-to-End Test
1. Create test application in CRM
2. Select application
3. Open Contact Finder modal
4. Set contacts per job = 3
5. Click Run
6. Verify n8n webhook receives correct data
7. Monitor n8n execution
8. Verify contacts appear in Supabase
9. Verify contacts appear in CRM
10. Verify credits deducted correctly

---

### Task 5.2: Error Handling Tests
- Insufficient credits
- Network timeout
- Apify API failure
- Apollo verification failure
- Duplicate contacts
- Invalid job data

---

### Task 5.3: Performance Testing
- 1 job with 5 contacts (baseline)
- 5 jobs with 3 contacts each
- 10 jobs with 10 contacts each (stress test)
- Measure: Time, success rate, accuracy

---

## 📝 IMPLEMENTATION CHECKLIST

### Frontend (Sivio)
- [ ] Add table view to CRM
- [ ] Add checkboxes for job selection
- [ ] Add "Contact Finder" button
- [ ] Create ContactFinderModal component
- [ ] Add credit cost calculator
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success confirmation

### Backend (Sivio)
- [ ] Create `/api/contact-finder/trigger` endpoint
- [ ] Fetch job data from Supabase
- [ ] Format data for n8n
- [ ] Call n8n webhook
- [ ] Reserve credits (pending transaction)
- [ ] Update `/api/contacts/webhook` to accept applicationId
- [ ] Update credits on completion

### n8n Workflow
- [ ] Webhook trigger
- [ ] Loop over jobs
- [ ] Apify HR search
- [ ] Apify team search
- [ ] Filter contacts
- [ ] Scrape LinkedIn profiles
- [ ] Merge data
- [ ] AI ranking
- [ ] Select top N
- [ ] Apollo verification
- [ ] Check duplicates
- [ ] Log to Google Sheets
- [ ] Push to Supabase webhook
- [ ] Error handling nodes

### Testing
- [ ] End-to-end happy path
- [ ] Insufficient credits
- [ ] API failures
- [ ] Duplicate contacts
- [ ] Performance (multiple jobs)

---

## 🚀 DEPLOYMENT PLAN

### Step 1: Deploy Frontend
1. Commit CRM UI changes
2. Commit Contact Finder modal
3. Commit API endpoints
4. Push to GitHub
5. Verify Vercel deployment

### Step 2: Deploy n8n Workflow
1. Import workflow JSON
2. Configure Apify credentials
3. Configure Apollo credentials
4. Set webhook URL
5. Test with dummy data
6. Activate workflow

### Step 3: Integration Test
1. Test with 1 real job
2. Verify end-to-end flow
3. Check data quality
4. Verify credit deduction

### Step 4: Launch
1. Announce feature to users
2. Monitor for errors
3. Gather feedback
4. Iterate

---

## 💰 COST ANALYSIS

### Per Contact Finder Run
- **Apify LinkedIn Search**: ~$0.01 per search
- **Apify Profile Scraper**: ~$0.005 per profile
- **Apollo Verification**: ~$0.01 per email
- **AI Ranking (Claude)**: ~$0.02 per job
- **Total per contact**: ~$0.04-0.05

### Example: 3 jobs × 5 contacts = 15 contacts
- **Apify cost**: $0.15
- **Apollo cost**: $0.15
- **AI cost**: $0.06
- **Total**: ~$0.36

**User pays**: 15 credits
**You charge**: ~$0.45 (15 × $0.03)
**Profit margin**: ~20%

---

## 🎯 SUCCESS METRICS

### Quality
- Relevance score avg: >80
- Email verification rate: >70%
- Location match rate: >90%

### Performance
- Time per job: <2 minutes
- Success rate: >95%
- User satisfaction: >4.5/5

### Business
- Usage rate: >50% of users
- Repeat usage: >3x per user per month
- Credit purchase rate: +30%

---

**Ready to start building? Let's do this! 🚀**
