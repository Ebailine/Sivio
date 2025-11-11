-- Migration: Add Adzuna integration fields to jobs table
-- Run this in Supabase SQL Editor

-- Add new fields for enhanced job data
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS adzuna_id TEXT UNIQUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contract_type TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_predicted BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_adzuna_id ON jobs(adzuna_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_contract_type ON jobs(contract_type);
CREATE INDEX IF NOT EXISTS idx_jobs_is_archived ON jobs(is_archived);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_min ON jobs(salary_min);

-- Add composite index for common queries (active jobs by date)
CREATE INDEX IF NOT EXISTS idx_jobs_active_recent ON jobs(is_archived, posted_date DESC) WHERE is_archived = false;

-- Comment
COMMENT ON COLUMN jobs.adzuna_id IS 'Unique identifier from Adzuna API';
COMMENT ON COLUMN jobs.contract_type IS 'Contract type from Adzuna (full-time, part-time, contract, etc.)';
COMMENT ON COLUMN jobs.category IS 'Job category from Adzuna';
COMMENT ON COLUMN jobs.salary_predicted IS 'Whether salary is predicted by Adzuna or actual';
COMMENT ON COLUMN jobs.is_archived IS 'Whether job is archived (older than 30 days)';
COMMENT ON COLUMN jobs.archived_at IS 'When job was archived';
COMMENT ON COLUMN jobs.last_synced_at IS 'Last time job data was synced from Adzuna';
