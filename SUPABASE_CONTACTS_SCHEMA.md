# Supabase `contacts` Table Schema

## After Running UPDATE_CONTACTS_TABLE.sql

Your `contacts` table now has these columns:

### Core Contact Info
- `id` - UUID (Primary Key, auto-generated)
- `name` - TEXT (LinkedIn contact name)
- `full_name` - TEXT (same as name, for compatibility)
- `first_name` - TEXT (optional)
- `last_name` - TEXT (optional)
- `email` - TEXT (nullable - LinkedIn may not have it)
- `position` - TEXT (contact's job title)
- `company_name` - TEXT (where contact works)
- `company_domain` - TEXT (e.g., "solomonpage.com")
- `location` - TEXT (contact's location)
- `linkedin_url` - TEXT (profile URL)

### Contact Finder Specific
- `user_id` - UUID (FK to users.id - who found this contact)
- `application_id` - UUID (FK to applications.id - which job application)
- `verified` - BOOLEAN (email verified or not)
- `email_status` - TEXT (unverified, verified, bounced, etc.)
- `relevance_score` - INTEGER (AI score 0-100)
- `reasoning` - TEXT (AI explanation why contact is relevant)
- `source` - TEXT (linkedin_apify, snov.io, etc.)
- `role_type` - TEXT (hr, team, manager, other)
- `department` - TEXT (Human Resources, etc.)
- `contact_method` - TEXT (email, linkedin, phone, etc.)

### System Fields
- `is_key_decision_maker` - BOOLEAN (HR = true)
- `metadata` - JSONB (extra data)
- `created_at` - TIMESTAMPTZ (when found)
- `updated_at` - TIMESTAMPTZ (auto-updated)

---

## n8n Workflow → Supabase Mapping

```javascript
{
  user_id: $json.userId,                    // From Extract & Split Jobs
  application_id: $json.applicationId,      // From Extract & Split Jobs
  name: $json.name,                         // From Apify → OpenAI → Create Contacts
  full_name: $json.name,                    // Same as name
  position: $json.position,                 // Contact's job title from LinkedIn
  email: $json.email,                       // Usually null (Apify doesn't provide)
  company_name: $json.company,              // Job company (from Extract & Split)
  company_domain: "solomonpage.com",        // Auto-generated from company name
  location: $json.location,                 // Contact location from LinkedIn
  linkedin_url: $json.linkedin_url,         // Profile URL from Apify
  verified: $json.verified,                 // false (email not verified yet)
  email_status: "unverified",               // Default status
  relevance_score: $json.relevance_score,   // AI score (0-100)
  reasoning: $json.reasoning,               // AI explanation
  source: $json.source,                     // "linkedin_apify"
  role_type: $json.role_type,               // "hr", "team", "other"
  department: "Human Resources",            // If role_type = "hr"
  is_key_decision_maker: true/false,        // If role_type = "hr"
}
```

---

## Google Sheets Columns

After the **Flatten Contact Data** node, Google Sheets will show:

| Column | Source | Example |
|--------|--------|---------|
| Date Found | Current timestamp | 2025-01-16 14:30 |
| Contact Name | $json.name | Samantha Jacobs |
| Contact Position | $json.position | Recruiting Manager |
| Contact Company | $json.company | Solomon Page |
| Contact Location | $json.location | New York City Metropolitan Area |
| LinkedIn URL | $json.linkedin_url | https://linkedin.com/in/samanthaziman |
| Email | $json.email | Not available |
| Verified | $json.verified | false |
| Relevance Score | $json.relevance_score | 98 |
| AI Reasoning | $json.reasoning | Recruiting Manager - perfect HR contact |
| Role Type | $json.role_type | hr |
| Job Applied For | $json.jobAppliedFor | Manager of Visual Merchandising at Solomon Page |
| Application ID | $json.applicationId | 29c58b52-f214-... |
| User ID | $json.userId | 64af6757-a8b9-... |

---

## Query Contacts in Your CRM

### Get all contacts for a user:
```sql
SELECT
  id,
  name,
  position,
  company_name,
  location,
  linkedin_url,
  relevance_score,
  role_type,
  reasoning,
  created_at
FROM contacts
WHERE user_id = 'USER_UUID'
ORDER BY relevance_score DESC, created_at DESC;
```

### Get contacts for a specific application:
```sql
SELECT
  name,
  position,
  company_name,
  linkedin_url,
  relevance_score,
  role_type,
  reasoning
FROM contacts
WHERE application_id = 'APPLICATION_UUID'
ORDER BY relevance_score DESC;
```

### Get only HR contacts:
```sql
SELECT
  name,
  position,
  company_name,
  linkedin_url,
  relevance_score
FROM contacts
WHERE user_id = 'USER_UUID' AND role_type = 'hr'
ORDER BY relevance_score DESC;
```

---

## RLS Policies

Users can only see their own contacts:
- SELECT: Users see only their `user_id` contacts
- INSERT: Users can only insert with their `user_id`
- UPDATE: Users can only update their own contacts
- DELETE: Users can only delete their own contacts

This is handled automatically via Clerk authentication.
