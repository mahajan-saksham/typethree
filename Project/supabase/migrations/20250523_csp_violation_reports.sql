-- Migration: Create CSP Violation Reports Table
-- This migration creates a table to store Content Security Policy violation reports

-- Create the csp_violation_reports table
CREATE TABLE IF NOT EXISTS public.csp_violation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_uri TEXT,
  referrer TEXT,
  violated_directive TEXT,
  effective_directive TEXT,
  original_policy TEXT,
  disposition TEXT,
  blocked_uri TEXT,
  line_number INTEGER,
  source_file TEXT,
  status_code INTEGER,
  script_sample TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false
);

-- Add comment
COMMENT ON TABLE public.csp_violation_reports IS 'Table to store Content Security Policy violation reports for monitoring and analysis';

-- Create index for efficient queries
CREATE INDEX idx_csp_reports_created_at ON public.csp_violation_reports(created_at);
CREATE INDEX idx_csp_reports_violated_directive ON public.csp_violation_reports(violated_directive);
CREATE INDEX idx_csp_reports_blocked_uri ON public.csp_violation_reports(blocked_uri);

-- Enable RLS on the table
ALTER TABLE public.csp_violation_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can view CSP violation reports
CREATE POLICY "Admins can view CSP violation reports" 
  ON public.csp_violation_reports 
  FOR SELECT 
  TO authenticated 
  USING (public.is_admin(auth.uid()));

-- Allow system to insert CSP violation reports
CREATE POLICY "Allow system to insert CSP violation reports" 
  ON public.csp_violation_reports 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Only admins can update CSP violation reports (e.g., to mark as processed)
CREATE POLICY "Admins can update CSP violation reports" 
  ON public.csp_violation_reports 
  FOR UPDATE 
  TO authenticated 
  USING (public.is_admin(auth.uid()));

-- No one can delete CSP violation reports (for audit trail integrity)
CREATE POLICY "No one can delete CSP violation reports" 
  ON public.csp_violation_reports 
  FOR DELETE 
  TO authenticated 
  USING (false);
