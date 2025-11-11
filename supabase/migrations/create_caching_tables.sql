-- =====================================================
-- CACHING LAYER FOR AI CONTACT DISCOVERY
-- =====================================================
-- This migration creates three caching tables to optimize
-- API usage and reduce costs for the Sivio platform
-- =====================================================

-- STEP 1: Create company_research_cache table
-- Stores scraped company data for 30 days
-- =====================================================
CREATE TABLE IF NOT EXISTS company_research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_domain TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  verified_domain TEXT NOT NULL,

  -- Rich company data (JSONB for flexibility)
  team_structure JSONB, -- {total_employees: 500, departments: {...}}
  office_locations JSONB, -- [{city: "SF", country: "US", is_hq: true}, ...]
  departments JSONB, -- ["Engineering", "Sales", "HR", ...]
  company_size_category TEXT, -- "startup", "scaleup", "enterprise"
  industry TEXT,

  -- LinkedIn/Apollo enrichment data
  linkedin_url TEXT,
  company_description TEXT,
  founded_year INTEGER,

  -- Cache metadata
  cache_hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- STEP 2: Create contact_search_results_cache table
-- Stores contact search results for 7 days per job
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_search_results_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Search parameters (composite unique key)
  company_domain TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT, -- Can be NULL

  -- Search strategy used by AI
  search_strategy JSONB NOT NULL, -- {targetTitles: [...], targetDepartments: [...], approach: "..."}
  strategy_confidence INTEGER NOT NULL, -- 0-100

  -- Cached results
  contacts JSONB NOT NULL, -- Array of contact objects with AI reasoning
  contact_count INTEGER NOT NULL,

  -- Quality metrics
  avg_relevance_score DECIMAL(5,2),
  key_decision_maker_count INTEGER DEFAULT 0,

  -- Cache metadata
  cache_hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- STEP 3: Create contact_search_logs table
-- Analytics and debugging for all search attempts
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Search parameters
  company_name TEXT NOT NULL,
  company_domain TEXT NOT NULL,
  job_title TEXT,
  job_id UUID, -- Can be NULL for manual searches

  -- Result metadata
  cache_hit BOOLEAN NOT NULL,
  contacts_found INTEGER NOT NULL,
  contacts_returned INTEGER NOT NULL,
  strategy_confidence INTEGER,

  -- Cost tracking
  snov_credits_used INTEGER DEFAULT 0,
  platform_credits_charged INTEGER NOT NULL,

  -- Performance metrics
  response_time_ms INTEGER,
  api_calls_made INTEGER DEFAULT 0, -- Number of external API calls

  -- Search strategy for analysis
  search_strategy JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index on user for analytics
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Company cache indexes
CREATE INDEX IF NOT EXISTS idx_company_cache_domain
  ON company_research_cache(company_domain);

CREATE INDEX IF NOT EXISTS idx_company_cache_expires
  ON company_research_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_company_cache_accessed
  ON company_research_cache(last_accessed_at DESC);

-- Contact search cache indexes
CREATE INDEX IF NOT EXISTS idx_contact_cache_domain
  ON contact_search_results_cache(company_domain);

CREATE INDEX IF NOT EXISTS idx_contact_cache_job
  ON contact_search_results_cache(job_title);

CREATE INDEX IF NOT EXISTS idx_contact_cache_expires
  ON contact_search_results_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_contact_cache_quality
  ON contact_search_results_cache(avg_relevance_score DESC, key_decision_maker_count DESC);

-- Unique index on search parameters (handles NULL job_description)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_cache_unique_search
  ON contact_search_results_cache(company_domain, job_title, COALESCE(job_description, ''));

-- Search logs indexes
CREATE INDEX IF NOT EXISTS idx_logs_user
  ON contact_search_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_cache_hit
  ON contact_search_logs(cache_hit, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_created
  ON contact_search_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_company
  ON contact_search_logs(company_domain, created_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_caches()
RETURNS TABLE(
  company_cache_deleted INTEGER,
  contact_cache_deleted INTEGER
) AS $$
DECLARE
  company_deleted INTEGER;
  contact_deleted INTEGER;
BEGIN
  -- Delete expired company research cache
  DELETE FROM company_research_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS company_deleted = ROW_COUNT;

  -- Delete expired contact search results cache
  DELETE FROM contact_search_results_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS contact_deleted = ROW_COUNT;

  -- Return counts
  RETURN QUERY SELECT company_deleted, contact_deleted;
END;
$$ LANGUAGE plpgsql;

-- Function to get cache hit rate statistics
CREATE OR REPLACE FUNCTION get_cache_hit_rate(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  total_searches BIGINT,
  cache_hits BIGINT,
  cache_misses BIGINT,
  hit_rate DECIMAL(5,2),
  avg_response_time_ms DECIMAL(10,2),
  total_credits_saved INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_searches,
    COUNT(*) FILTER (WHERE cache_hit = true)::BIGINT AS cache_hits,
    COUNT(*) FILTER (WHERE cache_hit = false)::BIGINT AS cache_misses,
    ROUND(
      (COUNT(*) FILTER (WHERE cache_hit = true)::DECIMAL / NULLIF(COUNT(*), 0)::DECIMAL * 100),
      2
    ) AS hit_rate,
    ROUND(AVG(response_time_ms)::DECIMAL, 2) AS avg_response_time_ms,
    COALESCE(SUM(CASE WHEN cache_hit = true THEN platform_credits_charged ELSE 0 END), 0)::INTEGER AS total_credits_saved
  FROM contact_search_logs
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all cache tables
ALTER TABLE company_research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_search_results_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_search_logs ENABLE ROW LEVEL SECURITY;

-- Company cache policies
CREATE POLICY "Service role has full access to company cache"
  ON company_research_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read company cache"
  ON company_research_cache
  FOR SELECT
  USING (true);

-- Contact search cache policies
CREATE POLICY "Service role has full access to contact cache"
  ON contact_search_results_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read contact cache"
  ON contact_search_results_cache
  FOR SELECT
  USING (true);

-- Search logs policies
CREATE POLICY "Service role has full access to search logs"
  ON contact_search_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their own search logs"
  ON contact_search_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'company_research_cache',
    'contact_search_results_cache',
    'contact_search_logs'
  );

  IF table_count = 3 THEN
    RAISE NOTICE 'SUCCESS: All 3 caching tables created';
  ELSE
    RAISE EXCEPTION 'FAILURE: Only % of 3 tables created', table_count;
  END IF;
END $$;

-- Verify indexes exist
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename LIKE '%cache%'
  OR tablename = 'contact_search_logs';

  RAISE NOTICE 'Created % indexes for caching tables', index_count;
END $$;

-- Test helper functions
SELECT 'Testing cleanup function...' AS status;
SELECT * FROM cleanup_expired_caches();

SELECT 'Testing cache hit rate function...' AS status;
SELECT * FROM get_cache_hit_rate(30);

-- Show table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
AND (tablename LIKE '%cache%' OR tablename = 'contact_search_logs')
ORDER BY tablename;
