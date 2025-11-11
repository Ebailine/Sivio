-- Credit Usage Tracking Table
-- Tracks Snov.io API credit usage for cost optimization analysis

CREATE TABLE IF NOT EXISTS credit_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- What action was performed
  action TEXT NOT NULL CHECK (action IN ('domain_search', 'email_finder', 'email_verification', 'prospect_search')),

  -- Credit costs
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_estimated INTEGER NOT NULL DEFAULT 0,
  credits_actual INTEGER NOT NULL DEFAULT 0,

  -- Results and efficiency
  results_count INTEGER NOT NULL DEFAULT 0,
  cost_per_contact DECIMAL(10, 2) NOT NULL DEFAULT 0,
  efficiency_score DECIMAL(10, 2) NOT NULL DEFAULT 0, -- (results / credits) * 100

  -- Additional context
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_user_id ON credit_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_created_at ON credit_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_action ON credit_usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_efficiency ON credit_usage_logs(efficiency_score DESC);

-- Enable Row Level Security
ALTER TABLE credit_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own credit usage logs
CREATE POLICY "Users can view own credit logs"
  ON credit_usage_logs
  FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- Service role can insert logs
CREATE POLICY "Service role can insert credit logs"
  ON credit_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- Service role can update logs
CREATE POLICY "Service role can update credit logs"
  ON credit_usage_logs
  FOR UPDATE
  USING (true);

-- Comments
COMMENT ON TABLE credit_usage_logs IS 'Tracks Snov.io API credit usage for cost optimization and ROI analysis';
COMMENT ON COLUMN credit_usage_logs.credits_estimated IS 'How many credits we expected to spend';
COMMENT ON COLUMN credit_usage_logs.credits_actual IS 'How many credits we actually spent';
COMMENT ON COLUMN credit_usage_logs.cost_per_contact IS 'Credits spent per contact found';
COMMENT ON COLUMN credit_usage_logs.efficiency_score IS 'Contacts found per credit * 100';
