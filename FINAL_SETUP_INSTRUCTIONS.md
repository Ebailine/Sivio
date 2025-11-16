# Final Optimized Workflow - Setup Instructions

## ✅ What's Fixed:

1. **Apify Input**: Now properly configured with company URL + search keywords
2. **Supabase Operation**: Changed from "executeQuery" to "getAll" (works!)
3. **Google Sheets Operation**: Changed to "Append" (adds rows)
4. **Cost Optimized**: Max 15 employees scraped per company (not 50!)
5. **Smart Filtering**: Targets HR + team-specific roles based on job description

---

## 💰 Cost Breakdown (Your Profit Model):

**Per Run (1 job, 5 contacts)**:
- Apify: ~$0.06-0.10 (scraping 15 people max)
- OpenAI: ~$0.01 (GPT-4o-mini)
- **Total**: ~$0.07-0.11

**You charge**: 5 credits = user pays you
**Your cost**: ~$0.11 maximum
**Your margin**: Depends on your credit pricing

**Recommendation**: Price 1 credit = $0.05-0.10 → 5 credits = $0.25-0.50 revenue

---

## 🚀 Setup (10 minutes):

### Step 1: Install Apify Node

1. n8n → Settings → Community Nodes
2. Install: `@apify/n8n-nodes-apify`
3. Wait for confirmation

### Step 2: Create Google Sheet

1. Go to Google Sheets: https://sheets.google.com
2. Create new sheet named: **"Contact Finder Logs"**
3. Add these column headers in Row 1:
   ```
   Timestamp | User ID | Job | Application ID | Total Found | Unique Added | Duplicates Skipped | Contact Names
   ```
4. Copy the Sheet ID from URL (the long string after `/d/`)
   Example: `https://docs.google.com/spreadsheets/d/1ABC123xyz/edit`
   Sheet ID = `1ABC123xyz`

### Step 3: Import Workflow

1. Delete old broken workflow (if you imported it)
2. n8n → Add workflow → Import from file
3. Select: `/Users/ethanbailine/Desktop/sivio/n8n-workflows/contact-finder-final-optimized.json`

### Step 4: Configure Nodes

#### A. Apify Node (Image 1 issue - FIXED)
1. Click **"Apify - Find Employees"** node
2. **Credential**: Select your "Apify account"
3. **Actor**: Should show "apify/linkedin-company-employees"
4. **Input JSON**: Leave EMPTY! (It's configured in the "input" field below)
5. **Input** (object field):
   - `companyUrl`: `={{ $json.companyUrl }}` ✅ (comes from previous node)
   - `searchKeywords`: `={{ $json.searchKeywords }}` ✅ (comes from previous node)
   - `maxItems`: `15` ✅ (hardcoded - keeps costs low!)
6. **Wait for Finish**: Toggle ON (green) ✅

#### B. Supabase Node (Image 2 issue - FIXED)
1. Click **"Check Duplicates (Supabase)"** node
2. **Credential**: Select your "Supabase account"
3. **Resource**: Row
4. **Operation**: **Get Many** ✅ (NOT "executeQuery"!)
5. **Table**: `contacts`
6. **Return All**: Toggle OFF
7. **Limit**: `1000`
8. **Options** → Add option → "Query String"
   - Value: `=user_id=eq.{{ $json.userId }}`

#### C. Google Sheets Node (Images 3 & 4 issue - FIXED)
1. Click **"Log to Google Sheets"** node
2. **Credential**: Select your "Google Sheets account"
3. **Resource**: **Sheet Within Document**
4. **Operation**: **Append or Update Row** ✅ (NOT "Get Row(s)"!)
5. **Document**: From list → Select your document OR enter Sheet ID
6. **Sheet**: From list → Select "Contact Finder Logs"
7. **Columns**:
   - Mapping mode: **Define Below**
   - Add mappings (should already be configured):
     - `Timestamp` = `={{ $now.toISO() }}`
     - `User ID` = `={{ $json.userId }}`
     - `Job` = `={{ $json.position + ' at ' + $json.company }}`
     - `Application ID` = `={{ $json.applicationId }}`
     - `Total Found` = `={{ $json.totalFound }}`
     - `Unique Added` = `={{ $json.uniqueCount }}`
     - `Duplicates Skipped` = `={{ $json.duplicatesRemoved }}`
     - `Contact Names` = `={{ $json.contacts.map(c => c.name + ' (' + c.role_type + ')').join(', ') }}`
8. **Options** → No properties needed
9. **Continue on Fail**: Toggle ON (so workflow doesn't break if sheets fails)

#### D. OpenAI Node
1. Click **"OpenAI - Final Ranking"** node
2. **Credential**: Select your "OpenAI account"
3. **Model**: `gpt-4o-mini` ✅
4. **Temperature**: `0.2` (consistent results)
5. Everything else is pre-configured ✅

### Step 5: Activate

1. Click **"Active"** toggle (top-right)
2. Should turn green/blue
3. Workflow is now LIVE!

---

## 🧪 Test It

### Test 1: Simple Webhook Test

```bash
curl -X POST "https://ebailine.app.n8n.cloud/webhook-test/148eaa2e-ca0f-46be-b4f2-647e48c28da7" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-123",
    "userEmail": "test@example.com",
    "contactsPerJob": 5,
    "jobs": [{
      "applicationId": "app-1",
      "jobId": "job-1",
      "company": "Google",
      "position": "Software Engineer",
      "location": "Mountain View, CA",
      "url": "https://www.linkedin.com/company/google",
      "description": "Build products"
    }]
  }'
```

**Expected**: `{"success": true, "message": "Contact finder started", "jobs": 1}`

### Test 2: Full End-to-End

1. Go to https://sivio.vercel.app/crm
2. Table view
3. Select 1 job
4. Click "Contact Finder"
5. Choose **5 contacts**
6. Click "Run"

**Expected** (in 2-3 minutes):
- ✅ n8n execution completes
- ✅ Google Sheet gets new row
- ✅ 5 contacts in Supabase
- ✅ 5 credits deducted

---

## 🎯 How It Works (Optimized for Profit):

1. **Receives webhook** → Responds immediately
2. **Loops each job** → One at a time
3. **Prepares Apify input** → Company URL + "recruiter HR {position keywords}"
4. **Apify scrapes LinkedIn** → Max 15 employees (COST CONTROL!)
5. **Filters & scores** → HR roles = 100 points, Team roles = 70 points, Others filtered out
6. **OpenAI refines ranking** → AI double-checks relevance
7. **Creates final contacts** → Top 5-10 (user's choice)
8. **Checks Supabase duplicates** → Avoids re-scraping same people
9. **Removes duplicates** → Only sends new contacts
10. **Logs to Google Sheets** → Track success rate
11. **Pushes to Sivio** → Contacts appear in your database
12. **Loops** → Next job or completes

---

## 💡 Quality Features:

### Smart Contact Targeting:
- **HR/Recruiters**: Highest priority (score 100+)
- **Team Members**: Based on job description keywords (score 70+)
- **Seniority Bonus**: +20 points for senior/lead/director
- **Location Bonus**: +10 points for location match

### Example for "Senior React Developer":
**Searches for**:
- "recruiter talent acquisition HR" (always)
- + "senior react developer engineer" (from job title)

**Finds**:
1. Technical Recruiter (score: 115) ← HR + seniority
2. Engineering Manager - Frontend (score: 85) ← team + seniority
3. Senior Software Engineer - React (score: 80) ← team + seniority + keywords
4. Talent Partner (score: 100) ← HR role
5. React Team Lead (score: 90) ← team + seniority + keywords

---

## 📊 Expected Results:

### Per Job:
- **Input**: 1 company + 1 position
- **Apify Scrapes**: 15 employees max
- **After Filtering**: 5-10 relevant contacts
- **After AI Ranking**: Top 5 (or user's choice)
- **After Duplicates**: 3-5 unique contacts typically
- **Cost**: ~$0.07-0.11

### Success Metrics:
- **Contact Quality**: 80%+ should be HR or hiring managers
- **Duplicate Rate**: <20% (most should be new)
- **Response Rate**: Track in Google Sheets over time

---

## 🐛 Troubleshooting:

### Apify returns 0 results:
- **Cause**: Invalid company URL or company has no LinkedIn
- **Fix**: Check company URL is valid LinkedIn company page

### Supabase error:
- **Cause**: Wrong operation selected or RLS issue
- **Fix**: Make sure operation is "Get Many", not "executeQuery"

### Google Sheets error:
- **Cause**: Sheet doesn't exist or columns mismatch
- **Fix**:
  1. Create sheet with exact name "Contact Finder Logs"
  2. Add 8 column headers in Row 1 (see Step 2)
  3. Make sure "Continue on Fail" is ON

### Too expensive:
- **Reduce maxItems**: Change from 15 to 10 in Apify node
- **Reduce contacts**: Users choose 3 instead of 5

---

## ✅ Final Checklist:

- [ ] Apify community node installed
- [ ] Google Sheet created with 8 columns
- [ ] Workflow imported
- [ ] Apify node configured (actor + input object)
- [ ] Supabase node operation = "Get Many"
- [ ] Google Sheets operation = "Append or Update Row"
- [ ] Google Sheets "Continue on Fail" = ON
- [ ] OpenAI credential linked
- [ ] Workflow activated
- [ ] Webhook test passes
- [ ] End-to-end test completes

---

## 🎯 You're Ready for Business!

This workflow is optimized for YOUR profit model:
- ✅ Low cost per run (~$0.11 max)
- ✅ High quality contacts (HR + team-specific)
- ✅ No waste (max 15 scrapes, smart filtering)
- ✅ Duplicate prevention (don't pay twice)
- ✅ Monitoring (Google Sheets logs)

**Import it, configure the 4 nodes, and start making money!** 💰
