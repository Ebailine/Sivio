-- Allow NULL emails for LinkedIn-only contacts
-- Migration: 20250111_allow_null_emails

-- Step 1: Make email column nullable
ALTER TABLE contacts
ALTER COLUMN email DROP NOT NULL;

-- Step 2: Add source column to track contact origin
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'snov.io';

-- Step 3: Add contact_method column
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS contact_method TEXT DEFAULT 'email';

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_method ON contacts(contact_method);
CREATE INDEX IF NOT EXISTS idx_contacts_fallback ON contacts(source, contact_method);

-- Step 5: Update existing contacts to have correct values
UPDATE contacts
SET source = 'snov.io', contact_method = 'email'
WHERE source IS NULL AND email IS NOT NULL;

-- Step 6: Add check constraint to ensure either email OR linkedin_url exists
ALTER TABLE contacts
ADD CONSTRAINT check_has_contact_info
CHECK (email IS NOT NULL OR linkedin_url IS NOT NULL);

-- Step 7: Comment the schema
COMMENT ON COLUMN contacts.source IS 'Origin of contact: snov.io, linkedin_inferred, pattern_generated';
COMMENT ON COLUMN contacts.contact_method IS 'Primary contact method: email, linkedin';
COMMENT ON CONSTRAINT check_has_contact_info ON contacts IS 'Ensures contact has either email or LinkedIn URL';

