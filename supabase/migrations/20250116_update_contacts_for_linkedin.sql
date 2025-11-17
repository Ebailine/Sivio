-- Update contacts table to support LinkedIn contact finder
-- This adds columns needed for the n8n workflow

-- Add new columns to contacts table
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reasoning TEXT,
  ADD COLUMN IF NOT EXISTS role_type TEXT,
  ADD COLUMN IF NOT EXISTS contact_method TEXT;

-- Update existing columns to allow NULL (since LinkedIn scraper may not have all data)
ALTER TABLE contacts
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN company_domain DROP NOT NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_application_id ON contacts(application_id);
CREATE INDEX IF NOT EXISTS idx_contacts_role_type ON contacts(role_type);

-- Add RLS policies for contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own contacts
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = contacts.user_id));

-- Policy: Users can insert their own contacts
CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = contacts.user_id));

-- Policy: Users can update their own contacts
CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = contacts.user_id));

-- Policy: Users can delete their own contacts
CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = contacts.user_id));

-- Comment on new columns
COMMENT ON COLUMN contacts.user_id IS 'User who found this contact';
COMMENT ON COLUMN contacts.application_id IS 'Job application this contact is associated with';
COMMENT ON COLUMN contacts.name IS 'Full name from LinkedIn (for Apify contacts)';
COMMENT ON COLUMN contacts.location IS 'Contact location from LinkedIn';
COMMENT ON COLUMN contacts.verified IS 'Whether email/contact has been verified';
COMMENT ON COLUMN contacts.reasoning IS 'AI reasoning for why this contact is relevant';
COMMENT ON COLUMN contacts.role_type IS 'Type of role: hr, team, manager, other';
COMMENT ON COLUMN contacts.contact_method IS 'Preferred method of contact';
