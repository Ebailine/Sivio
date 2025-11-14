-- ============================================================================
-- Fix All Text Columns (Combined Fix)
-- ============================================================================
-- Fixes both num_applicants and time_posted to accept LinkedIn's text format
-- This is the complete fix for all data type issues
-- ============================================================================

-- STEP 1: Drop the job_statistics view (depends on time_posted column)
DROP VIEW IF EXISTS job_statistics;

-- STEP 2: Change num_applicants from INTEGER to TEXT
ALTER TABLE jobs
  ALTER COLUMN num_applicants TYPE TEXT;

COMMENT ON COLUMN jobs.num_applicants IS 'Number of applicants on LinkedIn (text format, e.g., "Over 200 applicants")';

-- STEP 3: Change time_posted from TIMESTAMPTZ to TEXT
ALTER TABLE jobs
  ALTER COLUMN time_posted TYPE TEXT;

COMMENT ON COLUMN jobs.time_posted IS 'When job was posted on LinkedIn (text format, e.g., "2 days ago", "1 week ago")';

-- STEP 4: Update indexes
-- Drop old indexes
DROP INDEX IF EXISTS idx_jobs_time_posted;
DROP INDEX IF EXISTS idx_jobs_location_type_time;

-- Recreate time_posted index (simple, since it's now TEXT)
CREATE INDEX idx_jobs_time_posted ON jobs(time_posted);

-- Recreate composite index using created_at for sorting instead of time_posted
CREATE INDEX idx_jobs_location_type_created ON jobs(location, employment_type, created_at DESC);

-- STEP 5: Recreate the job_statistics view
-- Note: Uses created_at for date filtering since time_posted is now text
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
  RAISE NOTICE '✅ Fixed num_applicants column type to TEXT';
  RAISE NOTICE '✅ Fixed time_posted column type to TEXT';
  RAISE NOTICE '✅ Updated indexes to use created_at for date sorting';
  RAISE NOTICE '✅ Recreated job_statistics view';
  RAISE NOTICE '';
  RAISE NOTICE 'Your table now accepts LinkedIn text formats:';
  RAISE NOTICE '  - num_applicants: "Over 200 applicants"';
  RAISE NOTICE '  - time_posted: "2 days ago"';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for n8n workflow! 🚀';
END $$;
