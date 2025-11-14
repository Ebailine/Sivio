-- ============================================================================
-- Fix num_applicants Column Type
-- ============================================================================
-- Issue: LinkedIn returns applicant counts as text (e.g., "Over 200 applicants")
--        but column was defined as INTEGER
-- Solution: Change to TEXT to accept LinkedIn's format
-- ============================================================================

-- Change num_applicants from INTEGER to TEXT
ALTER TABLE jobs
  ALTER COLUMN num_applicants TYPE TEXT;

-- Update the comment
COMMENT ON COLUMN jobs.num_applicants IS 'Number of applicants on LinkedIn (as text, e.g., "Over 200 applicants", "Be among the first 25 applicants")';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed num_applicants column type to TEXT';
  RAISE NOTICE 'Column now accepts values like "Over 200 applicants"';
END $$;
