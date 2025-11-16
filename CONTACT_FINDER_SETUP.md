# Contact Finder Setup Guide

Complete setup instructions for the LinkedIn Contact Finder automation.

## 🎯 Overview

This automation finds the best HR contacts and hiring managers to reach out to after applying for jobs. It uses:
- **Apify** for LinkedIn scraping
- **n8n** for workflow automation
- **OpenAI GPT-4 Mini** for AI ranking
- **Supabase** for data storage
- **Credit system** for usage tracking

---

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ n8n account (cloud or self-hosted)
2. ✅ Apify account with API token
3. ✅ OpenAI API key
4. ✅ Google Sheets (optional, for logging)
5. ✅ Supabase project with tables set up

---

## 🚀 Setup Steps

### Step 1: Import n8n Workflow

1. **Open n8n**: Go to your n8n instance (e.g., `https://yourusername.app.n8n.cloud`)

2. **Import Workflow**:
   - Click **"Add workflow"** → **"Import from file"**
   - Select `/n8n-workflows/contact-finder-workflow.json`
   - The workflow will appear with all 17 nodes

3. **Verify Import**:
   - You should see nodes from "Webhook - Receive Job Data" to "Respond to Webhook"
   - All connections should be intact

---

### Step 2: Configure Credentials

#### A. Apify API Credentials

1. Get your Apify API token from: https://console.apify.com/account/integrations
2. In n8n, go to **Credentials** → **Add Credential** → **Apify API**
3. Name it: `Apify API`
4. Paste your token (from Apify dashboard)
5. Click **Save**

#### B. OpenAI API Credentials

1. Get your OpenAI API key from: https://platform.openai.com/api-keys
2. In n8n, go to **Credentials** → **Add Credential** → **OpenAI API**
3. Name it: `OpenAI API`
4. Paste your API key
5. Click **Save**

#### C. Supabase API Credentials

1. Get your Supabase URL and anon key from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. In n8n, go to **Credentials** → **Add Credential** → **Supabase API**
3. Name it: `Supabase API`
4. Fill in:
   - **Host**: `https://clwnebahltkbcjnzexwh.supabase.co`
   - **Service Role Secret**: Your service role key (from Supabase settings)
5. Click **Save**

#### D. Sivio Webhook Authentication

1. In n8n, go to **Credentials** → **Add Credential** → **Header Auth**
2. Name it: `Sivio Webhook Auth`
3. Add header:
   - **Name**: `x-webhook-secret`
   - **Value**: `your-webhook-secret-here` (generate a secure random string)
4. Click **Save**
5. **IMPORTANT**: Add this secret to your Sivio `.env.local`:
   ```bash
   WEBHOOK_SECRET=your-webhook-secret-here
   ```

#### E. Google Sheets (Optional)

1. In n8n, go to **Credentials** → **Add Credential** → **Google Sheets OAuth2 API**
2. Name it: `Google Sheets OAuth2`
3. Follow OAuth flow to connect your Google account
4. Create a new Google Sheet named "Contact Finder Logs"
5. Copy the sheet ID from the URL and update the "Log to Google Sheets" node

---

### Step 3: Configure Environment Variables

#### In n8n (Settings → Environment Variables)

Add these environment variables to your n8n instance:

```bash
# Apify API Token
APIFY_API_TOKEN=your-apify-api-token-here

# Supabase
SUPABASE_URL=https://clwnebahltkbcjnzexwh.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Sivio API (for webhook callback)
SIVIO_API_URL=https://sivio.vercel.app
```

#### In Sivio (`.env.local`)

Already configured, but verify:

```bash
# n8n Contact Finder Webhook (TEST URL)
N8N_CONTACT_FINDER_WEBHOOK_URL=https://ebailine.app.n8n.cloud/webhook-test/148eaa2e-ca0f-46be-b4f2-647e48c28da7

# When ready for production, switch to:
# N8N_CONTACT_FINDER_WEBHOOK_URL=https://ebailine.app.n8n.cloud/webhook/148eaa2e-ca0f-46be-b4f2-647e48c28da7

# Webhook Secret (must match n8n credential)
WEBHOOK_SECRET=your-webhook-secret-here
```

---

### Step 4: Update Webhook URL in Workflow

1. **Open the workflow** in n8n
2. Click on **"Webhook - Receive Job Data"** node
3. Verify the webhook path matches: `148eaa2e-ca0f-46be-b4f2-647e48c28da7`
4. Note the full webhook URL shown in the node (e.g., `https://ebailine.app.n8n.cloud/webhook-test/...`)
5. **Make sure this URL matches** the one in Sivio's `.env.local`

---

### Step 5: Activate the Workflow

1. Click **"Active"** toggle in top-right corner of n8n
2. The workflow is now live and listening for webhook triggers
3. The webhook URL will be available for testing

---

## 🧪 Testing the Workflow

### Test Webhook Manually

Use this curl command to test the webhook:

```bash
curl -X POST https://ebailine.app.n8n.cloud/webhook-test/148eaa2e-ca0f-46be-b4f2-647e48c28da7 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-uuid",
    "userEmail": "test@example.com",
    "contactsPerJob": 3,
    "jobs": [
      {
        "applicationId": "app-uuid-1",
        "jobId": "job-123",
        "company": "Google",
        "position": "Software Engineer",
        "location": "Mountain View, CA",
        "description": "Build amazing products...",
        "url": "https://www.linkedin.com/company/google",
        "domain": "google.com"
      }
    ]
  }'
```

### Check Execution in n8n

1. Go to **Executions** tab in n8n
2. You should see the workflow running
3. Click on the execution to see details
4. Verify each node completes successfully

### Expected Flow:

1. ✅ Webhook receives data
2. ✅ Parses webhook payload
3. ✅ Loops through jobs
4. ✅ Calls Apify to find employees
5. ✅ Waits for results (may take 30-60 seconds)
6. ✅ Filters relevant HR/recruiting contacts
7. ✅ Scrapes full profiles
8. ✅ AI ranks contacts by relevance
9. ✅ Selects top N contacts
10. ✅ Checks for duplicates in Supabase
11. ✅ Logs to Google Sheets
12. ✅ Pushes contacts to Sivio webhook
13. ✅ Returns success response

---

## 🔧 Troubleshooting

### Workflow doesn't trigger

- ✅ Check webhook URL matches in both n8n and Sivio
- ✅ Verify workflow is **Active**
- ✅ Check n8n execution logs for errors

### Apify errors

- ✅ Verify API token is correct
- ✅ Check Apify account credits
- ✅ Ensure company URL is valid LinkedIn URL
- ✅ Check Apify actor names are correct:
  - `caprolok~linkedin-employees-scraper`
  - `dev_fusion~linkedin-profile-scraper`

### OpenAI errors

- ✅ Verify API key is valid
- ✅ Check OpenAI account has credits
- ✅ Ensure model name is `gpt-4-mini` (not `gpt-4-turbo`)

### Contacts not appearing in Sivio

- ✅ Check webhook response in n8n logs
- ✅ Verify Sivio webhook endpoint is accessible
- ✅ Check Supabase logs for insert errors
- ✅ Verify user_id format (must be UUID)

### Duplicate contacts

- ✅ Check "Remove Duplicates" node logic
- ✅ Verify Supabase contacts table has data
- ✅ Check email/LinkedIn URL matching logic

---

## 🎨 Customization Options

### Change number of employees to scrape

In **"Apify - Find Employees"** node, change `maxEmployees`:
```json
{
  "maxEmployees": 50  // Change to 100 for more results
}
```

### Adjust AI ranking prompt

In **"OpenAI - Rank Contacts"** node, modify the prompt to emphasize different criteria:
```
Rank by:
1. Role relevance (weight: 40%)
2. Seniority level (weight: 30%)
3. Location match (weight: 20%)
4. Recent activity (weight: 10%)
```

### Add email verification

To add Apollo email verification later:
1. Add new node after "Select Top N Contacts"
2. Call Apollo API to verify/enrich emails
3. Filter out invalid emails
4. Continue to duplicate check

---

## 📊 Monitoring & Logs

### Google Sheets Logging

The workflow logs each run to Google Sheets with:
- Timestamp
- User ID
- Job details
- Contacts found
- Duplicates removed
- Contact names

This helps track:
- Usage patterns
- Success rates
- Credit consumption
- Error debugging

### n8n Execution History

Check n8n executions for:
- Failed runs
- Execution time
- Error messages
- Data flow between nodes

---

## 🚀 Going to Production

When ready to launch:

1. **Switch to Production Webhook**:
   ```bash
   # In Sivio .env.local, uncomment production URL:
   N8N_CONTACT_FINDER_WEBHOOK_URL=https://ebailine.app.n8n.cloud/webhook/148eaa2e-ca0f-46be-b4f2-647e48c28da7
   ```

2. **Update Webhook Node**:
   - Change path from `webhook-test/...` to `webhook/...`
   - Save and re-activate workflow

3. **Test End-to-End**:
   - Select jobs in CRM table view
   - Click "Contact Finder"
   - Choose number of contacts
   - Click "Run"
   - Verify contacts appear in CRM

4. **Monitor First Runs**:
   - Check Google Sheets logs
   - Verify credit deductions
   - Confirm contacts are high quality

---

## 💡 Tips for Best Results

1. **Start with 3-5 contacts per job** for balance of quantity and quality
2. **Apply to jobs with company LinkedIn pages** for better scraping
3. **Monitor Apify usage** to avoid running out of credits
4. **Review AI rankings** initially to tune the prompt
5. **Check for duplicates** before reaching out

---

## 🆘 Support

If you encounter issues:

1. Check n8n execution logs
2. Verify all credentials are correct
3. Test webhook with curl command
4. Check Apify actor documentation
5. Review error messages in Google Sheets logs

---

## 🎉 You're All Set!

The Contact Finder automation is now ready to use. Users can:

1. Go to CRM → Switch to Table view
2. Select jobs with checkboxes
3. Click "Contact Finder" button
4. Choose number of contacts (1-10)
5. Click "Run"
6. Wait for contacts to appear (1-5 minutes)
7. See best contacts ranked by AI relevance

Happy networking! 🚀
