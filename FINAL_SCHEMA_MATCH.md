# Supabase Contacts Table - EXACT Match to Google Sheets ✅

## What This Does:

This SQL script will **drop and recreate** your `contacts` table to match your Google Sheets columns **EXACTLY**.

---

## Your Google Sheets Columns (in order):

1. name
2. position
3. email
4. linkedin_url
5. verified
6. relevance_score
7. reasoning
8. source
9. role_type
10. applicationId
11. userId
12. jobCompany
13. jobPosition
14. jobLocation
15. contactLocation
16. jobAppliedFor

---

## New Supabase `contacts` Table Schema:

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- EXACT Google Sheets columns
  name TEXT,
  position TEXT,
  email TEXT,
  linkedin_url TEXT,
  verified BOOLEAN DEFAULT false,
  relevance_score INTEGER DEFAULT 0,
  reasoning TEXT,
  source TEXT DEFAULT 'linkedin_apify',
  role_type TEXT,
  applicationId UUID,
  userId UUID,
  jobCompany TEXT,
  jobPosition TEXT,
  jobLocation TEXT,
  contactLocation TEXT,
  jobAppliedFor TEXT,

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Step-by-Step Instructions:

### 1. Run SQL in Supabase

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of:
   ```
   /Users/ethanbailine/Desktop/sivio/MATCH_GOOGLE_SHEETS_SCHEMA.sql
   ```
5. Click **Run**

**⚠️ WARNING**: This will **delete all existing contacts**. If you have important data, back it up first!

---

### 2. Verify Schema in Supabase

After running the SQL, go to **Table Editor** → **contacts** and verify you see these columns:

- id (UUID)
- name (text)
- position (text)
- email (text)
- linkedin_url (text)
- verified (bool)
- relevance_score (int4)
- reasoning (text)
- source (text)
- role_type (text)
- applicationId (uuid)
- userId (uuid)
- jobCompany (text)
- jobPosition (text)
- jobLocation (text)
- contactLocation (text)
- jobAppliedFor (text)
- created_at (timestamptz)
- updated_at (timestamptz)

---

### 3. Re-import Updated Workflow (Recommended)

The workflow has been updated to use the new column names.

**Import this file**:
```
/Users/ethanbailine/Desktop/sivio/n8n-workflows/contact-finder-optimized-v2.json
```

**OR manually update the "Push to Supabase" node** with the new field mappings (see below).

---

### 4. Manual Update (if not re-importing)

If you don't want to re-import, update the **"Push to Supabase"** node:

**Old column names** → **New column names**:
- ❌ `user_id` → ✅ `userId`
- ❌ `application_id` → ✅ `applicationId`
- ❌ `company_name` → ✅ `jobCompany`
- ❌ `company_domain` → ❌ REMOVED (not needed)
- ❌ `contact_location` → ✅ `contactLocation`
- ❌ `job_location` → ✅ `jobLocation`
- ❌ `email_status` → ❌ REMOVED (not needed)
- ❌ `department` → ❌ REMOVED (not needed)
- ❌ `is_key_decision_maker` → ❌ REMOVED (not needed)
- ❌ `full_name` → ❌ REMOVED (not needed)

**New field mappings**:
```
name: {{ $json.name }}
position: {{ $json.position }}
email: {{ $json.email }}
linkedin_url: {{ $json.linkedin_url }}
verified: {{ $json.verified }}
relevance_score: {{ Math.round($json.relevance_score) }}
reasoning: {{ $json.reasoning }}
source: {{ $json.source }}
role_type: {{ $json.role_type }}
applicationId: {{ $json.applicationId }}
userId: {{ $json.userId }}
jobCompany: {{ $json.jobCompany }}
jobPosition: {{ $json.jobPosition }}
jobLocation: {{ $json.jobLocation }}
contactLocation: {{ $json.contactLocation }}
jobAppliedFor: {{ $json.jobAppliedFor }}
```

---

## Data Flow (Google Sheets → Supabase):

| Google Sheet Column | n8n Variable | Supabase Column |
|---------------------|--------------|-----------------|
| name | $json.name | name |
| position | $json.position | position |
| email | $json.email | email |
| linkedin_url | $json.linkedin_url | linkedin_url |
| verified | $json.verified | verified |
| relevance_score | $json.relevance_score | relevance_score |
| reasoning | $json.reasoning | reasoning |
| source | $json.source | source |
| role_type | $json.role_type | role_type |
| applicationId | $json.applicationId | applicationId |
| userId | $json.userId | userId |
| jobCompany | $json.jobCompany | jobCompany |
| jobPosition | $json.jobPosition | jobPosition |
| jobLocation | $json.jobLocation | jobLocation |
| contactLocation | $json.contactLocation | contactLocation |
| jobAppliedFor | $json.jobAppliedFor | jobAppliedFor |

**Perfect 1:1 mapping! No transformations needed!** ✅

---

## Query Contacts in Your CRM:

### Get all contacts for a user:
```sql
SELECT
  name,
  position,
  email,
  linkedin_url,
  verified,
  relevance_score,
  reasoning,
  source,
  role_type,
  applicationId,
  userId,
  jobCompany,
  jobPosition,
  jobLocation,
  contactLocation,
  jobAppliedFor,
  created_at
FROM contacts
WHERE userId = 'YOUR_USER_UUID'
ORDER BY relevance_score DESC, created_at DESC;
```

### Get contacts for a specific application:
```sql
SELECT
  name,
  position,
  linkedin_url,
  relevance_score,
  reasoning,
  role_type,
  contactLocation,
  jobAppliedFor
FROM contacts
WHERE applicationId = 'YOUR_APPLICATION_UUID'
ORDER BY relevance_score DESC;
```

### Get only HR contacts:
```sql
SELECT
  name,
  position,
  jobCompany,
  linkedin_url,
  relevance_score,
  reasoning
FROM contacts
WHERE userId = 'YOUR_USER_UUID' AND role_type = 'hr'
ORDER BY relevance_score DESC;
```

---

## Expected Results After Running:

### ✅ Supabase Table Editor:
- Table name: `contacts`
- 19 columns total (16 from Google Sheets + id + created_at + updated_at)
- Column names match Google Sheets EXACTLY
- Foreign keys: `userId` → users(id), `applicationId` → applications(id)
- RLS enabled: Users can only see their own contacts

### ✅ n8n Workflow:
- **Push to Supabase** node uses exact column names
- No field transformations needed
- Direct 1:1 mapping from Flatten Contact Data → Supabase

### ✅ Google Sheets:
- Same 16 columns as Supabase (minus id, created_at, updated_at)
- Data flows seamlessly: Google Sheets ↔ Supabase

---

## Files Created:

1. ✅ `/Users/ethanbailine/Desktop/sivio/MATCH_GOOGLE_SHEETS_SCHEMA.sql` - **Run this in Supabase**
2. ✅ `/Users/ethanbailine/Desktop/sivio/n8n-workflows/contact-finder-optimized-v2.json` - **Import this in n8n**
3. 📄 `/Users/ethanbailine/Desktop/sivio/FINAL_SCHEMA_MATCH.md` - This documentation

---

## Final Checklist:

- [ ] Run `MATCH_GOOGLE_SHEETS_SCHEMA.sql` in Supabase SQL Editor
- [ ] Verify `contacts` table has exact columns in Table Editor
- [ ] Re-import workflow OR update "Push to Supabase" node manually
- [ ] Update "Flatten Contact Data" node code (from previous fix)
- [ ] Test workflow end-to-end
- [ ] Verify 5 contacts appear in both Google Sheets AND Supabase
- [ ] Check Supabase column names match Google Sheets exactly

---

## You're Done! 🎉

After running the SQL and re-importing the workflow:
- ✅ Google Sheets columns = Supabase columns (perfect match)
- ✅ Data flows seamlessly between Google Sheets ↔ Supabase
- ✅ No more column name mismatches
- ✅ CRM can query contacts directly from Supabase
- ✅ Everything just works!

Let me know when you've run the SQL and we can test the full workflow!
