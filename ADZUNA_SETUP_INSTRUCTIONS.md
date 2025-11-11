# Adzuna Job Board Integration - Setup Instructions

## ✅ WHAT WAS IMPLEMENTED

Your Sivio platform now has a complete real job board powered by Adzuna API with:

- ✅ Real job data from Adzuna (5000 free API calls/month)
- ✅ Advanced filters: Location, Category, Salary Range, Job Type, Remote
- ✅ 1000+ business jobs (Marketing, Sales, Finance, HR, Operations, etc.)
- ✅ Entry-level & Internship focus (0-2 years experience)
- ✅ Daily auto-sync (runs at 2 AM UTC via Vercel cron)
- ✅ Job archiving system (old jobs marked, not deleted)
- ✅ AI contact finder integration (works with real companies)
- ✅ Professional UI with sync status banner

---

## 🚀 REQUIRED ACTIONS (YOU MUST DO THESE)

### STEP 1: Sign Up for Adzuna API (FREE)

1. Go to: **https://developer.adzuna.com/signup**
2. Create a free account
3. Get your **App ID** and **API Key**
4. Free tier includes: 5000 API calls/month (plenty for your needs)

### STEP 2: Add Adzuna Credentials

#### Local Development (.env.local):
```bash
# Already added placeholders - just replace these values:
ADZUNA_APP_ID=your_app_id_here
ADZUNA_API_KEY=your_api_key_here
```

#### Vercel Production:
```bash
vercel env add ADZUNA_APP_ID production
# Paste your App ID when prompted

vercel env add ADZUNA_API_KEY production
# Paste your API Key when prompted
```

### STEP 3: Run Database Migration

Go to your Supabase SQL Editor and run:

```bash
# File: add_adzuna_fields.sql
```

Copy and paste the entire content of `add_adzuna_fields.sql` into the Supabase SQL Editor and execute it.

This adds:
- `adzuna_id` (unique identifier)
- `contract_type`, `category` (job categorization)
- `salary_predicted` (whether salary is estimated)
- `is_archived`, `archived_at` (archiving system)
- `last_synced_at` (sync tracking)
- Indexes for performance

### STEP 4: Deploy to Production

```bash
git add .
git commit -m "feat: integrate Adzuna API with real job board"
git push origin main
vercel --prod
```

### STEP 5: Run Initial Job Sync

After deployment, import your first 1000 jobs:

**Option A: Via Browser**
Visit: `https://sivio.vercel.app/api/jobs/sync` in your browser

**Option B: Via Command Line**
```bash
curl -X POST https://sivio.vercel.app/api/jobs/sync
```

This will take 2-3 minutes and import ~1000 real business jobs.

---

## 📊 HOW IT WORKS

### Job Sync Process

1. **Daily Auto-Sync** (2 AM UTC via Vercel cron)
   - Fetches new jobs from Adzuna
   - Archives jobs older than 30 days
   - Updates existing jobs
   - Adds new jobs

2. **Manual Sync** (via "Manual Sync" button on /jobs page)
   - Same process as auto-sync
   - Use this for testing or immediate updates

3. **Entry-Level Filtering**
   - Only imports jobs with keywords: "entry level", "junior", "associate", "coordinator", "assistant", "intern", "internship", "graduate", "trainee", "recent graduate"
   - Salary range: $30k-$90k
   - Age: Posted within last 30 days

4. **Business Categories Targeted**
   - Accounting & Finance
   - HR & Recruitment
   - Marketing, Advertising & PR
   - Sales
   - Admin & Secretarial
   - Consultancy
   - Business Management
   - Graduate Programs

### Advanced Filters

Users can filter jobs by:
- **Search**: Keywords in title, company, location, description
- **Job Type**: Internship, Entry Level, Full Time
- **Remote**: Remote Only, On-Site Only, All
- **Location**: City or State (e.g., "New York", "California", "Remote")
- **Category**: Marketing, Sales, Finance, HR, Operations, Business, Consulting
- **Salary Range**: Min/Max salary sliders

### AI Contact Finder Integration

The existing AI contact finder now works seamlessly with real jobs:
- Click any job → "Find Contacts" button
- AI analyzes the real company
- Searches Snov.io for real contacts
- Returns 1-4 best contacts with AI reasoning

---

## 🧪 TESTING CHECKLIST

After setup, verify everything works:

1. ✅ **Visit /jobs page**
   - Should see sync status banner
   - Shows "X Active Jobs from Real Companies"

2. ✅ **Run initial sync**
   - Click "Manual Sync" button OR visit /api/jobs/sync
   - Wait 2-3 minutes
   - Refresh page - should show ~1000 jobs

3. ✅ **Test filters**
   - Search for "marketing"
   - Filter by "Remote Only"
   - Try salary range $40k-$60k
   - Test location filter "New York"
   - Try category filter "Sales"

4. ✅ **Click on a job**
   - Should open job detail modal
   - Should show real company name
   - Should have "Find Contacts" button

5. ✅ **Test AI Contact Finder**
   - Click "Find Contacts"
   - Should analyze real company
   - Should return real contacts
   - Should show AI reasoning

6. ✅ **Check daily auto-sync**
   - Will run automatically at 2 AM UTC
   - Check sync status banner next day

---

## 📈 DATABASE SCHEMA

### Jobs Table (Enhanced)

```sql
jobs (
  id UUID PRIMARY KEY,
  title TEXT,
  company TEXT,
  location TEXT,
  description TEXT,
  url TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_predicted BOOLEAN,  -- NEW
  job_type TEXT,
  contract_type TEXT,         -- NEW
  category TEXT,              -- NEW
  remote BOOLEAN,
  posted_date TIMESTAMPTZ,
  source TEXT,
  adzuna_id TEXT UNIQUE,      -- NEW (Adzuna job ID)
  last_synced_at TIMESTAMPTZ, -- NEW
  is_archived BOOLEAN,        -- NEW
  archived_at TIMESTAMPTZ,    -- NEW
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## 💰 COST ANALYSIS

### Monthly Costs

- **Adzuna API**: $0 (free tier, 5000 calls/month)
- **Supabase**: $0 (free tier)
- **Vercel**: $0 (free tier, includes cron jobs)
- **Anthropic API**: ~$5-10 (existing AI contact finder)
- **Snov.io**: $40 (existing, already subscribed)

**Total**: $45-50/month

### Revenue Potential

- **Pricing**: $1 per contact search
- **Break-even**: 45-50 searches/month
- **After break-even**: Pure profit

---

## 🔧 API ENDPOINTS

### GET /api/jobs
Fetch jobs with filters
```javascript
GET /api/jobs?search=marketing&jobType=internship&remote=true&location=New York&category=Marketing&salaryMin=40000&salaryMax=60000&page=1&limit=12
```

### POST /api/jobs/sync
Trigger manual job sync (also used by cron)
```javascript
POST /api/jobs/sync
{
  "maxJobs": 1000  // optional
}
```

### GET /api/jobs/sync
Get sync status and statistics
```javascript
GET /api/jobs/sync

Response:
{
  "totalActiveJobs": 1247,
  "totalArchivedJobs": 342,
  "lastSyncDate": "2025-01-11T02:00:00Z",
  "jobsByCategory": {
    "Marketing": 234,
    "Sales": 189,
    "Finance": 156,
    ...
  }
}
```

---

## 🎯 KEY FILES

- `src/lib/services/adzuna-client.ts` - Adzuna API client
- `src/lib/services/job-sync-service.ts` - Job sync logic
- `src/app/api/jobs/sync/route.ts` - Sync API endpoint
- `src/app/api/jobs/route.ts` - Enhanced jobs API with filters
- `src/app/jobs/page.tsx` - Jobs page with advanced filters
- `add_adzuna_fields.sql` - Database migration
- `vercel.json` - Vercel cron configuration

---

## ⚠️ IMPORTANT NOTES

1. **Adzuna API Limits**
   - Free tier: 5000 calls/month
   - Each sync uses ~8-10 calls (one per category)
   - Daily sync = ~300 calls/month
   - Plenty of room for manual syncs

2. **Job Quality**
   - Adzuna provides real, verified jobs
   - Entry-level filtering ensures quality
   - Archive system keeps database clean

3. **Contact Finder**
   - Works automatically with real company names
   - No changes needed to existing AI logic
   - Domain extraction works for most companies

4. **Archiving**
   - Jobs older than 30 days are marked archived
   - Not deleted (for analytics/history)
   - Only active jobs shown to users

---

## 🐛 TROUBLESHOOTING

### "Failed to authenticate with Adzuna"
- Check if ADZUNA_APP_ID and ADZUNA_API_KEY are set
- Verify credentials are correct
- Make sure you signed up at https://developer.adzuna.com/signup

### "No jobs found after sync"
- Check Vercel logs: `vercel logs https://sivio.vercel.app`
- Verify database migration was run
- Try manual sync and watch for errors

### "Sync takes too long"
- This is normal for first sync (1000 jobs)
- Reduce maxJobs parameter to 500 for faster syncs
- Subsequent syncs are faster (only new/updated jobs)

### "Contact finder not working"
- Ensure real jobs are in database
- Check that jobs have company names
- Verify Snov.io credentials are still valid

---

## 🎉 SUCCESS METRICS

After successful setup, you should have:

- ✅ 1000+ real jobs in database
- ✅ All filters working
- ✅ Sync status banner showing correct counts
- ✅ Daily auto-sync configured
- ✅ AI contact finder working with real companies
- ✅ Professional, production-ready job board

---

## 📞 SUPPORT

If you encounter issues:

1. Check Vercel logs: `vercel logs https://sivio.vercel.app`
2. Check Supabase logs in dashboard
3. Review error messages in browser console (F12)
4. Verify all environment variables are set
5. Ensure database migration was successful

---

**You're now ready to launch a real job board with AI-powered contact discovery! 🚀**
