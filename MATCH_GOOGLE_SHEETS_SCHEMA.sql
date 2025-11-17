-- ================================================
-- UPDATE CONTACTS TABLE TO MATCH GOOGLE SHEETS EXACTLY
-- Run this in Supabase SQL Editor
-- ================================================

-- Drop the existing contacts table and recreate it with exact Google Sheets columns
DROP TABLE IF EXISTS contacts CASCADE;

-- Create contacts table matching Google Sheets columns EXACTLY
CREATE TABLE contacts (
  -- Primary key (not in Google Sheets but needed for database)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google Sheets columns (in exact order)
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

  -- System timestamps (helpful for tracking)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraints
  CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_application FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_userId ON contacts(userId);
CREATE INDEX idx_contacts_applicationId ON contacts(applicationId);
CREATE INDEX idx_contacts_role_type ON contacts(role_type);
CREATE INDEX idx_contacts_relevance_score ON contacts(relevance_score DESC);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_linkedin_url ON contacts(linkedin_url);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own contacts
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = contacts.userId));

-- RLS Policy: Users can insert their own contacts
CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = contacts.userId));

-- RLS Policy: Users can update their own contacts
CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = contacts.userId));

-- RLS Policy: Users can delete their own contacts
CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = contacts.userId));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE contacts IS 'LinkedIn contacts found via Contact Finder automation';
COMMENT ON COLUMN contacts.name IS 'Contact full name from LinkedIn';
COMMENT ON COLUMN contacts.position IS 'Contact job title from LinkedIn';
COMMENT ON COLUMN contacts.email IS 'Contact email (usually null from LinkedIn scraper)';
COMMENT ON COLUMN contacts.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN contacts.verified IS 'Whether contact has been verified';
COMMENT ON COLUMN contacts.relevance_score IS 'AI relevance score (0-100)';
COMMENT ON COLUMN contacts.reasoning IS 'AI explanation for why contact is relevant';
COMMENT ON COLUMN contacts.source IS 'Source of contact (linkedin_apify, etc)';
COMMENT ON COLUMN contacts.role_type IS 'Contact role type (hr, team, manager, other)';
COMMENT ON COLUMN contacts.applicationId IS 'Job application this contact is for';
COMMENT ON COLUMN contacts.userId IS 'User who found this contact';
COMMENT ON COLUMN contacts.jobCompany IS 'Company from job application';
COMMENT ON COLUMN contacts.jobPosition IS 'Position from job application';
COMMENT ON COLUMN contacts.jobLocation IS 'Location from job application';
COMMENT ON COLUMN contacts.contactLocation IS 'Contact location from LinkedIn';
COMMENT ON COLUMN contacts.jobAppliedFor IS 'Formatted job title (e.g. Manager at Company)';

-- Verify the schema matches Google Sheets
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'contacts'
  AND column_name NOT IN ('id', 'created_at', 'updated_at')
ORDER BY ordinal_position;

-- Show sample query for your CRM
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
ORDER BY created_at DESC
LIMIT 10;
