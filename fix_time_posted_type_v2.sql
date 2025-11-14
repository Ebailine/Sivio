-- ============================================================================
-- Fix time_posted Column Type (v2 - handles view dependency)
-- ============================================================================
-- Issue: LinkedIn returns posting time as text (e.g., "2 days ago", "1 week ago")
--        but column was defined as TIMESTAMPTZ
-- Solution: Drop dependent view, change column type, recreate view
-- ============================================================================

-- STEP 1: Drop the job_statistics view (depends on time_posted column)
DROP VIEW IF EXISTS job_statistics;

-- STEP 2: Change time_posted from TIMESTAMPTZ to TEXT
ALTER TABLE jobs
  ALTER COLUMN time_posted TYPE TEXT;

-- STEP 3: Update the comment
COMMENT ON COLUMN jobs.time_posted IS 'When job was posted on LinkedIn (text format, e.g., "2 days ago", "1 week ago")';

-- STEP 4: Drop and recreate indexes
DROP INDEX IF EXISTS idx_jobs_time_posted;
DROP INDEX IF EXISTS idx_jobs_location_type_time;

-- Recreate as simple index
CREATE INDEX idx_jobs_time_posted ON jobs(time_posted);

-- Recreate composite index without time_posted, use created_at instead for sorting
CREATE INDEX idx_jobs_location_type_created ON jobs(location, employment_type, created_at DESC);

-- STEP 5: Recreate the job_statistics view
-- (Note: time_posted filter removed since it's now text, using created_at instead)
CREATE OR REPLACE VIEW job_statistics AS
SELECT
  COUNT(*) as total_jobs,
  COUNT(DISTINCT company_name) as total_companies,
  COUNT(DISTINCT location) as total_locations,
  COUNT(*) FILTER (WHERE easy_apply = true) as easy_apply_jobs,
  COUNT(*) FILTER (WHERE employment_type = 'Full-time') as fulltime_jobs,
  COUNT(*) FILTER (WHERE employment_type = 'Internship') as internship_jobs,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as jobs_last_week,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as jobs_last_month
FROM jobs;

COMMENT ON VIEW job_statistics IS 'Real-time statistics about jobs in the database';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed time_posted column type to TEXT';
  RAISE NOTICE '✅ Updated indexes to use created_at for date sorting';
  RAISE NOTICE '✅ Recreated job_statistics view';
  RAISE NOTICE 'Column now accepts values like "2 days ago", "1 week ago"';
END $$;
