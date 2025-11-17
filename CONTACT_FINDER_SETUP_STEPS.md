# Contact Finder - Final Setup Steps

## Issues Found:
1. ✅ **Split Out Contacts** - Working correctly (outputs 5 items)
2. ❌ **Google Sheets** - "Sheet with ID Sheet1 not found" - needs configuration
3. ❌ **Supabase** - Column mismatch - table schema doesn't match workflow

---

## Step 1: Update Supabase Table Schema

Your `contacts` table is missing columns needed for the LinkedIn workflow.

**Run this SQL in Supabase SQL Editor:**

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy and paste the contents of: `/Users/ethanbailine/Desktop/sivio/UPDATE_CONTACTS_TABLE.sql`
3. Click **Run** to execute the migration

**This will add:**
- `user_id` - User who found the contact
- `application_id` - Job application this contact is for
- `name` - Full name from LinkedIn
- `location` - Contact location
- `verified` - Email verification status
- `reasoning` - AI reasoning for relevance
- `role_type` - Type of role (hr, team, other)
- `contact_method` - Preferred contact method

**It will also:**
- Make `email` and `company_domain` nullable (LinkedIn may not have emails)
- Add Row Level Security (RLS) policies so users only see their own contacts
- Create indexes for better performance

---

## Step 2: Configure Google Sheets in n8n

### Option A: Use Existing Google Sheet
1. Open your Google Sheets and find the sheet you want to use
2. Note the **Sheet ID** from the URL (e.g., `1T_EHOTJmjiLcWVemwytNN8i6fuGvw5DUL5u7OMn3Xng`)
3. In n8n workflow:
   - Click on **"Clear Google Sheet"** node
   - Select your document from the dropdown (not "Sheet1" text)
   - Select the actual sheet name (e.g., "Sheet1", "Contacts", etc.)
4. Repeat for **"Log Contacts to Sheets"** node

### Option B: Create New Google Sheet
1. Go to Google Sheets: https://sheets.google.com
2. Create a new spreadsheet named "Contact Finder Logs"
3. Add headers to first row:
   - Date Found
   - Contact Name
   - Position
   - Company
   - Location
   - LinkedIn URL
   - Relevance Score
   - AI Reasoning
   - Role Type
   - Job Applied For
   - Application ID
4. In n8n workflow:
   - Click on **"Clear Google Sheet"** node
   - Select "Contact Finder Logs" from dropdown
   - Select "Sheet1" from sheet dropdown
5. Repeat for **"Log Contacts to Sheets"** node

---

## Step 3: Re-Import Updated n8n Workflow

**File to import:**
```
/Users/ethanbailine/Desktop/sivio/n8n-workflows/contact-finder-optimized-v2.json
```

**After import:**
1. Connect all credentials:
   - ✅ Apify
   - ✅ OpenAI
   - ✅ Supabase
   - ✅ Google Sheets

2. Configure Google Sheets nodes (see Step 2 above)

3. Test the workflow with one job

---

## Step 4: Verify Data Flow

After running the workflow, check:

### ✅ n8n Execution Log
- All nodes should be green
- **Split Out Contacts** should show 5+ items
- **Log Contacts to Sheets** should show success
- **Push to Supabase** should show success

### ✅ Google Sheets
- Should be cleared before each run
- Should have fresh contact data with all 11 columns filled

### ✅ Supabase Contacts Table
- Run this query to check:
  ```sql
  SELECT
    name,
    position,
    company_name,
    linkedin_url,
    relevance_score,
    role_type,
    reasoning,
    created_at
  FROM contacts
  ORDER BY created_at DESC
  LIMIT 10;
  ```

### ✅ Your CRM
- Contacts should appear automatically
- Query contacts by `user_id` to see user's contacts
- Query by `application_id` to see contacts for specific job

---

## Updated Workflow Mapping

### Supabase Column Mapping:
```
n8n Data          →  Supabase Column
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$json.userId      →  user_id
$json.applicationId → application_id
$json.name        →  name + full_name
$json.position    →  position
$json.email       →  email (nullable)
$json.company     →  company_name
company_domain    →  company_domain (generated)
$json.location    →  location
$json.linkedin_url →  linkedin_url
$json.verified    →  verified
$json.relevance_score → relevance_score
$json.reasoning   →  reasoning
$json.source      →  source
$json.role_type   →  role_type + department + is_key_decision_maker
"unverified"      →  email_status
```

---

## Final Workflow Flow:

```
1. Webhook receives job data
2. Respond Immediately (200 OK)
3. Extract & Split Jobs
4. Apify - Scrape 15 LinkedIn employees
5. Aggregate Contacts (filter spam)
6. OpenAI Rank (AI scoring)
7. Create Contacts (format data)
8. Check Duplicates (Supabase query)
9. Merge (handles empty Supabase)
10. Remove Duplicates (LinkedIn URL dedup)
11. ├─→ Clear Google Sheet (parallel)
    └─→ Split Out Contacts (array → items)
12.     ├─→ Log Contacts to Sheets
        └─→ Push to Supabase ✅
```

---

## Expected Cost Per Run:

| Service | Cost |
|---------|------|
| Apify (15 contacts) | $0.07-0.11 |
| OpenAI (GPT-4o-mini) | $0.02-0.05 |
| n8n workflow executions | Free (cloud tier) |
| Google Sheets API | Free |
| Supabase operations | Free (tier limits) |
| **TOTAL** | **~$0.09-0.16 per run** ✅ |

**Well under your $0.35 budget!**

---

## Troubleshooting:

### Google Sheets Error: "Sheet with ID Sheet1 not found"
- You need to **select the actual sheet from the dropdown**, not type "Sheet1"
- Click the dropdown and pick your Google Sheet document

### Supabase Error: "column X does not exist"
- Run the `UPDATE_CONTACTS_TABLE.sql` script in Supabase SQL Editor
- Verify columns exist with: `\d contacts` or check Table Editor

### No contacts appearing in CRM
- Check Supabase RLS policies are enabled
- Verify `user_id` matches the logged-in user
- Query directly: `SELECT * FROM contacts WHERE user_id = 'YOUR_USER_ID'`

### Contacts showing in Supabase but not in CRM
- Check your CRM query is filtering by `user_id`
- Verify the frontend is fetching from the `contacts` table
- Check browser console for errors

---

## Next Steps After This Works:

1. **Build CRM Contacts Page** - `/crm/contacts` to view all found contacts
2. **Add Email Verification** - Integrate Apollo or Hunter.io
3. **Add Contact Actions** - Email templates, LinkedIn messages, tracking
4. **Analytics Dashboard** - Show contact conversion rates, best companies, etc.

---

## Files Created:

- `/Users/ethanbailine/Desktop/sivio/UPDATE_CONTACTS_TABLE.sql` - Supabase migration
- `/Users/ethanbailine/Desktop/sivio/n8n-workflows/contact-finder-optimized-v2.json` - Updated workflow
- `/Users/ethanbailine/Desktop/sivio/CONTACT_FINDER_SETUP_STEPS.md` - This file

---

**You're almost there! Just need to:**
1. ✅ Run the SQL migration in Supabase
2. ✅ Configure Google Sheets in n8n
3. ✅ Test the workflow

Let me know when you've completed these steps and I'll help with any issues!
