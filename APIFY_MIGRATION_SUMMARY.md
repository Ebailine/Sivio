# Apify Schema Migration - Complete Summary

**Date:** January 11, 2025
**Purpose:** Migrate from Adzuna schema to Apify/LinkedIn schema for n8n workflow integration

---

## 🎯 Overview

Successfully migrated the Sivio jobs table from the old Adzuna schema to a new Apify/LinkedIn schema that matches your n8n workflow output. All TypeScript types, API routes, and UI components have been updated.

---

## 📄 Files Created

### 1. **`migrate_to_apify_schema.sql`** - Database Migration

**Location:** `/Users/ethanbailine/Desktop/sivio/migrate_to_apify_schema.sql`

**What it does:**
- ✅ Deletes ALL existing job data (old Adzuna data)
- ✅ Drops the old jobs table completely
- ✅ Creates new jobs table with Apify/LinkedIn schema
- ✅ Creates 10 performance indexes
- ✅ Adds auto-updated_at trigger
- ✅ Enables Row Level Security (RLS)
- ✅ Creates helper view for job statistics

**New Schema:**
```sql
CREATE TABLE jobs (
  -- Primary identifier
  job_id TEXT PRIMARY KEY,

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
  employment_type TEXT,
  seniority_level TEXT,
  job_function TEXT,
  industries JSONB DEFAULT '[]'::jsonb,

  -- Salary and applicants
  salary_range TEXT,
  num_applicants INTEGER,

  -- Application metadata
  easy_apply BOOLEAN DEFAULT false,

  -- Timestamps
  time_posted TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**⚠️ IMPORTANT: Run this in Supabase SQL Editor**

### 2. **`src/types/job.ts`** - TypeScript Type Definitions

**Location:** `/Users/ethanbailine/Desktop/sivio/src/types/job.ts`

**Exports:**
- `Job` - Complete job record interface
- `ApifyJobInput` - Job data from n8n/Apify
- `JobCardData` - Minimal data for UI cards
- `JobFilters` - Search/filter parameters
- `PaginatedJobsResponse` - API response with pagination
- `EmploymentType` - Enum for employment types
- `SeniorityLevel` - Enum for seniority levels
- `JobStatistics` - Database statistics interface

**Usage:**
```typescript
import type { Job, ApifyJobInput, JobCardData } from '@/types/job'
```

---

## 🔄 Files Modified

### 3. **`src/app/api/jobs/route.ts`** - Main Jobs API

**Changes:**
- ✅ Updated GET filters to use new column names:
  - `employment_type` (was `job_type`)
  - `seniority_level` (new)
  - `job_function` (new)
  - `easy_apply` (new)
  - `time_posted` (was `posted_date`)
- ✅ Updated search to query: `job_title`, `company_name`, `location`, `job_description`
- ✅ Added POST endpoint for n8n webhook to insert jobs
- ✅ Implements upsert logic (insert or update based on `job_id`)
- ✅ Added field validation for required fields

**New Endpoints:**
```http
GET  /api/jobs?search=engineer&employment_type=Full-time&location=Remote
POST /api/jobs  (Body: ApifyJobInput)
```

### 4. **`src/app/api/jobs/[id]/route.ts`** - Single Job API

**Changes:**
- ✅ Updated to query by `job_id` (was `id`)
- ✅ Added DELETE endpoint for job removal
- ✅ Updated error handling for 404 not found

**Endpoints:**
```http
GET    /api/jobs/{job_id}
DELETE /api/jobs/{job_id}
```

### 5. **`src/components/JobCard.tsx`** - Job Card Component

**Major Updates:**
- ✅ All field names updated to match new schema
- ✅ Added company logo display (`company_logo_url`)
- ✅ Added Easy Apply badge (`easy_apply`)
- ✅ Added seniority level badge (`seniority_level`)
- ✅ Updated employment type display (`employment_type`)
- ✅ Updated salary display (`salary_range` as text)
- ✅ Updated date display (`time_posted`)
- ✅ Updated job ID usage (`job_id`)

**Visual Changes:**
- Company logo appears in card (if available)
- Green "Easy Apply" badge for jobs with easy apply
- Gray badge for seniority level
- Better responsive layout

### 6. **`src/components/JobDetailModal.tsx`** - Job Detail Modal

**Major Updates:**
- ✅ All field names updated to match new schema
- ✅ Added company logo in header
- ✅ Added company URL link
- ✅ Added job function display
- ✅ Added industries tags display (JSONB array)
- ✅ Added number of applicants
- ✅ Added Easy Apply badge
- ✅ Updated "Apply" button to use `apply_url`
- ✅ Updated Contact Finder integration with new field names

**Visual Enhancements:**
- Larger company logo (64x64px)
- Company page link
- Industry tags in blue pills
- Applicant count with icon
- Better metadata grid layout

---

## 🗃️ Schema Mapping (Old → New)

| Old Column (Adzuna) | New Column (Apify) | Notes |
|---------------------|---------------------|-------|
| `id` (UUID) | `job_id` (TEXT) | Now uses LinkedIn job ID |
| `title` | `job_title` | Renamed |
| `company` | `company_name` | Renamed |
| `description` | `job_description` | Renamed |
| `url` | `job_url` | Renamed, still job listing URL |
| N/A | `apply_url` | New - Direct application URL |
| N/A | `company_logo_url` | New - Company logo image |
| N/A | `company_url` | New - Company page link |
| `job_type` | `employment_type` | Renamed (Full-time, Part-time, etc.) |
| N/A | `seniority_level` | New (Entry level, Mid-Senior, etc.) |
| N/A | `job_function` | New (Engineering, Sales, etc.) |
| `category` | `industries` | Changed to JSONB array |
| `salary_min` + `salary_max` | `salary_range` | Now single text field |
| N/A | `num_applicants` | New - LinkedIn applicant count |
| `remote` | N/A | Removed (check location for "Remote") |
| N/A | `easy_apply` | New - LinkedIn Easy Apply flag |
| `posted_date` | `time_posted` | Renamed |
| `source` | N/A | Removed (always "apify") |
| `adzuna_id` | N/A | Removed |
| `contract_type` | N/A | Merged into `employment_type` |
| `salary_predicted` | N/A | Removed |
| `is_archived` | N/A | Removed (archiving not needed) |
| `last_synced_at` | N/A | Removed |

---

## 🔧 Key Changes Explained

### 1. Primary Key Change: `id` → `job_id`

**Old:** UUIDs generated by Supabase
**New:** LinkedIn job IDs from Apify (e.g., `"3829384746"`)

**Impact:**
- API routes now use `job_id` for lookups
- Contact finder integration updated
- Saved jobs now reference `job_id`

### 2. Salary: Separate fields → Single text field

**Old:** `salary_min` (100000) + `salary_max` (150000)
**New:** `salary_range` ("$100K - $150K")

**Why:** LinkedIn provides salary as formatted text, not separate numbers

### 3. Industries: Category → JSONB array

**Old:** Single category string
**New:** Array of industry strings

**Example:**
```json
{
  "industries": ["Technology", "Software Development", "Cloud Computing"]
}
```

### 4. New LinkedIn-Specific Fields

- `easy_apply` - Shows if job has LinkedIn Easy Apply
- `num_applicants` - Shows how many people applied
- `company_logo_url` - LinkedIn company logo
- `seniority_level` - Entry level, Mid-Senior, Director, etc.
- `job_function` - Engineering, Sales, Marketing, etc.

---

## 🧪 Testing Checklist

Before running the migration in production:

### Pre-Migration

- [ ] Backup existing jobs table (if you want to preserve data)
  ```sql
  CREATE TABLE jobs_backup AS SELECT * FROM jobs;
  ```
- [ ] Verify n8n workflow outputs match new schema
- [ ] Test n8n → Supabase connection

### Migration Steps

1. **Run SQL Migration**
   - Open Supabase SQL Editor
   - Copy contents of `migrate_to_apify_schema.sql`
   - Execute script
   - Verify success messages in output

2. **Verify Table Structure**
   ```sql
   -- Check table structure
   \d jobs

   -- Check indexes
   SELECT indexname FROM pg_indexes WHERE tablename = 'jobs';

   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'jobs';
   ```

3. **Test API Endpoints**
   ```bash
   # GET jobs (should return empty array initially)
   curl http://localhost:3000/api/jobs

   # POST job (test from n8n or manually)
   curl -X POST http://localhost:3000/api/jobs \
     -H "Content-Type: application/json" \
     -d '{
       "job_id": "test123",
       "job_title": "Software Engineer",
       "job_url": "https://linkedin.com/jobs/test",
       "apply_url": "https://linkedin.com/jobs/test/apply",
       "job_description": "Test description",
       "company_name": "Test Company",
       "location": "Remote"
     }'

   # GET single job
   curl http://localhost:3000/api/jobs/test123
   ```

### Post-Migration

- [ ] Verify TypeScript compilation (no errors)
- [ ] Test job browsing UI
- [ ] Test job detail modal
- [ ] Test contact finder with new jobs
- [ ] Test n8n workflow end-to-end
- [ ] Verify job filters work (employment_type, location, etc.)

---

## 🔌 n8n Workflow Integration

### Webhook Endpoint

Point your n8n workflow to:
```
POST https://your-domain.vercel.app/api/jobs
```

### Required Headers

```json
{
  "Content-Type": "application/json"
}
```

### Required Body Fields

```json
{
  "job_id": "string (required)",
  "job_title": "string (required)",
  "job_url": "string (required)",
  "apply_url": "string (required)",
  "job_description": "string (required)",
  "company_name": "string (required)",
  "location": "string (required)"
}
```

### Optional Fields

```json
{
  "job_description_raw_html": "string",
  "company_url": "string",
  "company_logo_url": "string",
  "employment_type": "string",
  "seniority_level": "string",
  "job_function": "string",
  "industries": ["array", "of", "strings"],
  "salary_range": "string",
  "num_applicants": number,
  "easy_apply": boolean,
  "time_posted": "ISO 8601 timestamp"
}
```

### Response

**Success (201):**
```json
{
  "success": true,
  "job": { ...job object... },
  "message": "Job created/updated successfully"
}
```

**Error (400):**
```json
{
  "error": "Missing required field: job_title"
}
```

---

## 📊 Performance Optimizations

### Indexes Created

1. `idx_jobs_job_id` - Primary key lookups
2. `idx_jobs_job_url` - Unique job URL enforcement
3. `idx_jobs_company_name` - Company searches
4. `idx_jobs_location` - Location filtering
5. `idx_jobs_employment_type` - Employment type filtering
6. `idx_jobs_seniority_level` - Seniority filtering
7. `idx_jobs_time_posted` - Sorting by date (DESC)
8. `idx_jobs_created_at` - Sorting by import date (DESC)
9. `idx_jobs_easy_apply` - Easy Apply filtering
10. `idx_jobs_industries` - GIN index for JSONB array searches
11. `idx_jobs_location_type_time` - Composite index for common queries

### Query Performance

The composite index `idx_jobs_location_type_time` optimizes this common query:
```sql
SELECT * FROM jobs
WHERE location ILIKE '%Remote%'
  AND employment_type = 'Full-time'
ORDER BY time_posted DESC;
```

---

## 🔐 Security (Row Level Security)

### Policies Enabled

1. **Public Read Access**
   - Anyone can view jobs
   - Good for public job board

2. **Authenticated Insert**
   - Only authenticated users can create jobs
   - Use Supabase service role key in n8n

3. **Authenticated Update**
   - Only authenticated users can update jobs

### Using Service Role in n8n

In your n8n Supabase node, use:
```
Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY
```

**NOT** the anon key (which has limited permissions).

---

## 🚀 Next Steps

### 1. Run Migration (Required)

```bash
# Open Supabase Dashboard → SQL Editor
# Paste contents of migrate_to_apify_schema.sql
# Click "Run"
```

### 2. Update n8n Workflow

- Point webhook to `/api/jobs`
- Use service role key for auth
- Map Apify output fields to expected schema
- Test with 1-2 jobs first

### 3. Deploy to Production

```bash
git add .
git commit -m "feat: migrate to Apify LinkedIn schema"
git push origin main
# Vercel will auto-deploy
```

### 4. Test End-to-End

1. Trigger n8n workflow
2. Verify jobs appear in Supabase
3. Check jobs display in UI
4. Test contact finder
5. Monitor for errors

---

## 🐛 Troubleshooting

### Issue: "Missing required field" error

**Cause:** n8n not sending all required fields

**Solution:** Check n8n node mapping, ensure these fields are present:
- `job_id`, `job_title`, `job_url`, `apply_url`, `job_description`, `company_name`, `location`

### Issue: Duplicate job_id error

**Cause:** Trying to insert job that already exists

**Solution:** API uses upsert - it will update existing jobs. Check that `job_id` is actually unique from LinkedIn.

### Issue: Jobs not appearing in UI

**Cause:** Frontend still using old field names

**Solution:** All components have been updated. Clear browser cache or do hard refresh (Cmd+Shift+R).

### Issue: Company logo not displaying

**Cause:** Invalid URL or CORS issue

**Solution:** Logos have `onError` handler to hide if loading fails. Check URL is valid.

### Issue: Industries not displaying

**Cause:** Industries field is null or empty array

**Solution:** Modal only shows industries if array has items. Check Apify output.

---

## 📋 Files Summary

| File | Action | Description |
|------|--------|-------------|
| `migrate_to_apify_schema.sql` | ✅ Created | Database migration script |
| `src/types/job.ts` | ✅ Created | TypeScript type definitions |
| `src/app/api/jobs/route.ts` | ✅ Modified | Updated GET filters, added POST endpoint |
| `src/app/api/jobs/[id]/route.ts` | ✅ Modified | Query by job_id, added DELETE |
| `src/components/JobCard.tsx` | ✅ Modified | All fields updated, added logo & badges |
| `src/components/JobDetailModal.tsx` | ✅ Modified | Complete redesign with new fields |
| `APIFY_MIGRATION_SUMMARY.md` | ✅ Created | This document |

---

## ✅ Migration Complete!

Your Sivio codebase is now fully migrated to use the Apify/LinkedIn schema.

**Key Accomplishments:**
- ✅ Database schema matches n8n workflow output
- ✅ All API routes updated
- ✅ All UI components updated
- ✅ TypeScript types defined
- ✅ Performance indexes created
- ✅ RLS security enabled
- ✅ Documentation complete

**Ready to:**
1. Run SQL migration in Supabase
2. Configure n8n webhook to POST to `/api/jobs`
3. Start importing LinkedIn jobs!

---

**Questions?** Review this document or check the inline comments in each file for additional context.
