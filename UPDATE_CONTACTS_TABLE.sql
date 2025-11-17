-- ================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Updates contacts table for LinkedIn Contact Finder
-- ================================================

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;

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

-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contacts'
ORDER BY ordinal_position;
