-- Migration: Create security_logs table for comprehensive security logging
-- This table will store all security-related events including admin access attempts

-- Create the security_logs table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Add comment
COMMENT ON TABLE public.security_logs IS 'Table to store security-related events for auditing and monitoring';

-- Create index on user_id for efficient lookups
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);

-- Create index on event_type for filtering by event type
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);

-- Create index on created_at for time-based queries
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at);

-- Create index on severity for filtering by severity level
CREATE INDEX idx_security_logs_severity ON public.security_logs(severity);

-- Add RLS policies to secure the logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view all security logs" 
  ON public.security_logs 
  FOR SELECT 
  TO authenticated 
  USING (public.is_admin(auth.uid()));

-- System can insert security logs
CREATE POLICY "Allow system to insert security logs" 
  ON public.security_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- No one can update or delete security logs (immutable audit trail)
CREATE POLICY "No one can update security logs" 
  ON public.security_logs 
  FOR UPDATE 
  TO authenticated 
  USING (false);

CREATE POLICY "No one can delete security logs" 
  ON public.security_logs 
  FOR DELETE 
  TO authenticated 
  USING (false);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_severity TEXT DEFAULT 'info'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Validate severity
  IF p_severity NOT IN ('info', 'warning', 'error', 'critical') THEN
    p_severity := 'info';
  END IF;
  
  -- Insert the log entry
  INSERT INTO public.security_logs (
    user_id,
    event_type,
    ip_address,
    user_agent,
    details,
    severity
  ) VALUES (
    p_user_id,
    p_event_type,
    p_ip_address,
    p_user_agent,
    p_details,
    p_severity
  ) RETURNING id INTO v_log_id;
  
  -- Return the generated log ID
  RETURN v_log_id;
END;
$$;
