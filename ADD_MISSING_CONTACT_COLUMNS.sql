-- ================================================
-- ADD MISSING COLUMNS TO CONTACTS TABLE
-- Run this in Supabase SQL Editor
-- ================================================

-- Add missing required columns to contacts table
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS role_type TEXT,
  ADD COLUMN IF NOT EXISTS contact_location TEXT,
  ADD COLUMN IF NOT EXISTS reasoning TEXT,
  ADD COLUMN IF NOT EXISTS application_id UUID;

-- Update existing rows: populate 'name' from position if name is null
-- (You'll need to manually update these properly, but this prevents errors)
UPDATE contacts
SET name = COALESCE(name, position, 'Unknown Contact')
WHERE name IS NULL OR name = '';

-- Add foreign key constraint for user_id (if users table exists)
ALTER TABLE contacts
  ADD CONSTRAINT fk_contacts_user_id
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Add foreign key constraint for application_id (if applications table exists)
ALTER TABLE contacts
  ADD CONSTRAINT fk_contacts_application_id
  FOREIGN KEY (application_id)
  REFERENCES applications(id)
  ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_application_id ON contacts(application_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contacts'
ORDER BY ordinal_position;
