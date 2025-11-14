-- ============================================================================
-- Fix time_posted Column Type
-- ============================================================================
-- Issue: LinkedIn returns posting time as text (e.g., "2 days ago", "1 week ago")
--        but column was defined as TIMESTAMPTZ
-- Solution: Change to TEXT to accept LinkedIn's format
-- ============================================================================

-- Change time_posted from TIMESTAMPTZ to TEXT
ALTER TABLE jobs
  ALTER COLUMN time_posted TYPE TEXT;

-- Update the comment
COMMENT ON COLUMN jobs.time_posted IS 'When job was posted on LinkedIn (text format, e.g., "2 days ago", "1 week ago")';

-- Drop the index on time_posted (can't index TEXT with DESC the same way)
DROP INDEX IF EXISTS idx_jobs_time_posted;

-- Recreate as simple index
CREATE INDEX idx_jobs_time_posted ON jobs(time_posted);

-- Drop the composite index that includes time_posted
DROP INDEX IF EXISTS idx_jobs_location_type_time;

-- Recreate composite index without time_posted, use created_at instead for sorting
CREATE INDEX idx_jobs_location_type_created ON jobs(location, employment_type, created_at DESC);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed time_posted column type to TEXT';
  RAISE NOTICE '✅ Updated indexes to use created_at for date sorting';
  RAISE NOTICE 'Column now accepts values like "2 days ago", "1 week ago"';
END $$;
