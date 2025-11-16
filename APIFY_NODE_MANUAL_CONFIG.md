# Manual Apify Node Configuration

Since the JSON import isn't working properly, follow these **EXACT** steps in your n8n UI:

## Step 1: Delete the Apify Node
1. Click on the "Apify - Scrape Employees" node
2. Press Delete/Backspace

## Step 2: Add a Fresh Apify Node
1. Click the **+** button between "Extract & Split Jobs" and "Filter & Score"
2. Search for "Apify"
3. Select the **Apify** node (the one with the Apify logo)

## Step 3: Configure Apify Node - Basic Settings
1. **Credential**: Select your "Apify account"
2. **Resource**: Actor
3. **Operation**: Run an Actor

## Step 4: Configure Actor Selection
1. **Actor Source**: From list
2. **Actor**: Type or search for: `caprolok/linkedin-employees-scraper`
   - Or select "Linkedin Employees Scraper" if it shows in the list

## Step 5: Configure Input JSON (CRITICAL!)

Click in the **Input JSON** field and paste this EXACT expression:

```
={
  "companyUrls": {{ JSON.stringify($json.companyUrls) }},
  "designation": {{ JSON.stringify($json.designation) }},
  "maxResultsPerCompany": {{ $json.maxResultsPerCompany }}
}
```

**Important**:
- Make sure it starts with `=` (equals sign)
- The curly braces `{{ }}` are n8n's expression syntax
- This will pull data from the previous "Extract & Split Jobs" node

## Step 6: Wait for Finish
1. Toggle **Wait for Finish** to ON (green)

## Step 7: Test the Node
1. Click "Execute Node" button
2. You should see the Input JSON resolve to something like:
```json
{
  "companyUrls": ["https://www.linkedin.com/company/sgep/"],
  "designation": ["HR", "HR manager", "recruiter", "talent", "talent acquisition", "people operations", "people partner", "hiring manager", "executive assistant"],
  "maxResultsPerCompany": 15
}
```

## Step 8: Save
1. Click outside the node or press Escape
2. Save the workflow
3. Test the full workflow

---

## What This Does

The "Extract & Split Jobs" node outputs:
```javascript
{
  companyUrls: ["https://linkedin.com/company/..."],
  designation: ["HR", "recruiter", "talent", ...],
  maxResultsPerCompany: 15
}
```

The Apify node takes those values and sends them to the LinkedIn scraper actor, which returns 10-15 HR/recruiting contacts per company.

---

## If You Still Get Errors

Screenshot:
1. The Input JSON field (what you typed)
2. The resolved value (what it evaluates to after expressions)
3. The full error message

And send those to me so I can see exactly what's happening.
