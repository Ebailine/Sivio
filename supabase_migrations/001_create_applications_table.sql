-- Create applications table for tracking job applications
-- This table tracks when users apply to jobs and their application status

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL, -- job_id from LinkedIn/Apify jobs table

  -- Application details
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  location TEXT,
  employment_type TEXT,
  seniority_level TEXT,
  salary_range TEXT,

  -- Application status (Kanban stages)
  stage TEXT NOT NULL DEFAULT 'applied',
  -- Stages: 'applied', 'interviewing', 'offer', 'accepted', 'rejected'

  status TEXT NOT NULL DEFAULT 'Application Submitted',
  -- Status examples: 'Application Submitted', 'Interview Scheduled', 'Offer Received', etc.

  -- Important dates
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  upcoming_interview TIMESTAMP WITH TIME ZONE,
  offer_date TIMESTAMP WITH TIME ZONE,
  acceptance_date TIMESTAMP WITH TIME ZONE,
  rejection_date TIMESTAMP WITH TIME ZONE,

  -- Notes as JSONB array of {id, text, date}
  notes JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_user_stage ON public.applications(user_id, stage);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own applications
CREATE POLICY "Users can view their own applications"
  ON public.applications
  FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert their own applications"
  ON public.applications
  FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can update their own applications"
  ON public.applications
  FOR UPDATE
  USING (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can delete their own applications"
  ON public.applications
  FOR DELETE
  USING (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id));

-- Grant permissions
GRANT ALL ON public.applications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
