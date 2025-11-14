-- ============================================================================
-- SIVIO: Apify LinkedIn Jobs Schema Migration
-- ============================================================================
-- Purpose: Replace Adzuna job schema with Apify/LinkedIn job schema
-- Date: January 2025
-- Author: Sivio Team
--
-- WARNINGS:
-- ⚠️  This migration DELETES ALL existing job data
-- ⚠️  This migration DROPS the existing jobs table
-- ⚠️  Make sure to backup data if needed before running
-- ⚠️  Run this in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Delete all existing data and drop old table
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- Drop the old jobs table if it exists (cascades to related tables)
  DROP TABLE IF EXISTS jobs CASCADE;

  RAISE NOTICE 'Old jobs table dropped successfully';
END $$;

-- STEP 2: Create new jobs table with Apify/LinkedIn schema
-- ----------------------------------------------------------------------------
CREATE TABLE jobs (
  -- Primary identifier (using job_id from LinkedIn/Apify)
  job_id TEXT PRIMARY KEY,

  -- Core job information
  job_title TEXT NOT NULL,
  job_url TEXT NOT NULL UNIQUE,
  apply_url TEXT NOT NULL,
  job_description TEXT NOT NULL,
  job_description_raw_html TEXT,

  -- Company information
  company_name TEXT NOT NULL,
  company_url TEXT,
  company_logo_url TEXT,

  -- Job details
  location TEXT NOT NULL,
  employment_type TEXT,
  seniority_level TEXT,
  job_function TEXT,
  industries JSONB DEFAULT '[]'::jsonb, -- Array of industries

  -- Salary and applicants
  salary_range TEXT,
  num_applicants TEXT, -- LinkedIn returns text like "Over 200 applicants"

  -- Application metadata
  easy_apply BOOLEAN DEFAULT false,

  -- Timestamps
  time_posted TEXT, -- LinkedIn text format: "2 days ago", "1 week ago"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create indexes for performance
-- ----------------------------------------------------------------------------
CREATE INDEX idx_jobs_job_id ON jobs(job_id);
CREATE INDEX idx_jobs_job_url ON jobs(job_url);
CREATE INDEX idx_jobs_company_name ON jobs(company_name);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_seniority_level ON jobs(seniority_level);
CREATE INDEX idx_jobs_time_posted ON jobs(time_posted); -- Simple index (TEXT column)
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_easy_apply ON jobs(easy_apply);

-- GIN index for JSONB industries array (for searching within array)
CREATE INDEX idx_jobs_industries ON jobs USING GIN(industries);

-- Composite index for common queries (location + employment_type + created_at for sorting)
CREATE INDEX idx_jobs_location_type_created ON jobs(location, employment_type, created_at DESC);

-- STEP 4: Create updated_at trigger function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Attach trigger to jobs table
-- ----------------------------------------------------------------------------
CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();

-- STEP 6: Add comments for documentation
-- ----------------------------------------------------------------------------
COMMENT ON TABLE jobs IS 'LinkedIn jobs imported via Apify actor through n8n workflow';

COMMENT ON COLUMN jobs.job_id IS 'Unique LinkedIn job identifier from Apify';
COMMENT ON COLUMN jobs.job_title IS 'Job title/position name';
COMMENT ON COLUMN jobs.job_url IS 'LinkedIn job listing URL (unique)';
COMMENT ON COLUMN jobs.apply_url IS 'Direct application URL';
COMMENT ON COLUMN jobs.job_description IS 'Plain text job description';
COMMENT ON COLUMN jobs.job_description_raw_html IS 'Original HTML job description from LinkedIn';
COMMENT ON COLUMN jobs.company_name IS 'Hiring company name';
COMMENT ON COLUMN jobs.company_url IS 'Company LinkedIn or website URL';
COMMENT ON COLUMN jobs.company_logo_url IS 'Company logo image URL';
COMMENT ON COLUMN jobs.location IS 'Job location (city, state, country, or remote)';
COMMENT ON COLUMN jobs.employment_type IS 'Full-time, Part-time, Contract, Internship, etc.';
COMMENT ON COLUMN jobs.seniority_level IS 'Entry level, Mid-Senior level, Director, Executive, etc.';
COMMENT ON COLUMN jobs.job_function IS 'Job function category (Engineering, Sales, Marketing, etc.)';
COMMENT ON COLUMN jobs.industries IS 'JSONB array of industry tags';
COMMENT ON COLUMN jobs.salary_range IS 'Salary range as text (e.g., "$80K - $120K")';
COMMENT ON COLUMN jobs.num_applicants IS 'Number of applicants on LinkedIn (text format, e.g., "Over 200 applicants")';
COMMENT ON COLUMN jobs.easy_apply IS 'Whether job has LinkedIn Easy Apply enabled';
COMMENT ON COLUMN jobs.time_posted IS 'When job was posted on LinkedIn (text format, e.g., "2 days ago", "1 week ago")';
COMMENT ON COLUMN jobs.created_at IS 'When job was imported into Sivio database (actual timestamp)';
COMMENT ON COLUMN jobs.updated_at IS 'Last time job record was updated (actual timestamp)';

-- STEP 7: Enable Row Level Security (RLS) - Optional but recommended
-- ----------------------------------------------------------------------------
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (adjust based on your needs)
CREATE POLICY "Allow public read access to jobs"
  ON jobs
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated users can insert (for n8n webhook)
-- Note: You'll need to use service role key in n8n for inserts
CREATE POLICY "Allow authenticated insert to jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Allow authenticated update to jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (true);

-- STEP 8: Create helper view for job statistics (optional)
-- ----------------------------------------------------------------------------
-- Note: time_posted is TEXT (not timestamp), so we use created_at for date filtering
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

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next steps:
-- 1. Verify table structure: SELECT * FROM jobs LIMIT 1;
-- 2. Check indexes: \d jobs (in psql) or use Supabase Table Editor
-- 3. Test insert from n8n workflow
-- 4. Update TypeScript types in your application
-- ============================================================================

-- Output success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📊 New jobs table created with Apify/LinkedIn schema';
  RAISE NOTICE '🔍 Total indexes created: 10';
  RAISE NOTICE '⚡ Triggers enabled for auto-updated_at';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Update your n8n workflow to insert jobs using this schema';
END $$;
