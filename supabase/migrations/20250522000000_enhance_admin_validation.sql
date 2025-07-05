-- Migration: Enhance Admin Validation Function with Security Improvements
-- This migration enhances the existing is_admin function with better security, 
-- input validation, rate limiting, and compatibility with existing code

-- First, let's create a table to track validation attempts for rate limiting
CREATE TABLE IF NOT EXISTS public.auth_validation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  validation_type TEXT NOT NULL DEFAULT 'admin_check'
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_auth_validation_user_id ON public.auth_validation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_validation_attempted_at ON public.auth_validation_attempts(attempted_at);

-- Add RLS policies to protect the validation attempts table
ALTER TABLE public.auth_validation_attempts ENABLE ROW LEVEL SECURITY;

-- Only administrators can view the validation attempts
CREATE POLICY "Admins can view validation attempts" 
  ON public.auth_validation_attempts FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() AND user_profiles.role = 'admin'
  ));

-- Validation attempts can be inserted by any authenticated user
CREATE POLICY "Allow authenticated users to create validation records" 
  ON public.auth_validation_attempts FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create a function to record validation attempts
CREATE OR REPLACE FUNCTION public.record_validation_attempt(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT false,
  p_validation_type TEXT DEFAULT 'admin_check'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.auth_validation_attempts (
    user_id,
    ip_address,
    user_agent,
    success,
    validation_type
  ) VALUES (
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_success,
    p_validation_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is rate limited
CREATE OR REPLACE FUNCTION public.is_rate_limited(
  p_user_id UUID,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 5,
  p_validation_type TEXT DEFAULT 'admin_check'
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.auth_validation_attempts
  WHERE user_id = p_user_id
    AND validation_type = p_validation_type
    AND success = false
    AND attempted_at > (NOW() - (p_window_minutes || ' minutes')::interval);
    
  RETURN attempt_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced is_admin function with security improvements
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid, p_ip_address TEXT DEFAULT NULL, p_user_agent TEXT DEFAULT NULL)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin BOOLEAN;
  valid_user_id BOOLEAN;
  rate_limited BOOLEAN;
BEGIN
  -- Input validation: Ensure user_id is valid
  IF user_id IS NULL THEN
    PERFORM public.record_validation_attempt(auth.uid(), p_ip_address, p_user_agent, false);
    RETURN false;
  END IF;
  
  -- Check if user exists in auth.users to validate UUID
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  ) INTO valid_user_id;
  
  IF NOT valid_user_id THEN
    PERFORM public.record_validation_attempt(user_id, p_ip_address, p_user_agent, false);
    RETURN false;
  END IF;
  
  -- Check for rate limiting
  SELECT public.is_rate_limited(user_id) INTO rate_limited;
  
  IF rate_limited THEN
    PERFORM public.record_validation_attempt(user_id, p_ip_address, p_user_agent, false);
    RETURN false;
  END IF;
  
  -- Perform the actual admin check
  SELECT (role = 'admin') INTO is_admin 
  FROM public.user_profiles 
  WHERE user_profiles.user_id = user_id
  LIMIT 1;
  
  -- Record the validation attempt
  PERFORM public.record_validation_attempt(
    user_id, 
    p_ip_address, 
    p_user_agent, 
    COALESCE(is_admin, false)
  );
  
  -- Return the result with a fallback to false
  RETURN COALESCE(is_admin, false);
END;
$function$;

-- For backward compatibility, create an overloaded function that
-- matches the original signature but calls the enhanced version
CREATE OR REPLACE FUNCTION public.is_admin_backward_compat(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY INVOKER
AS $function$
BEGIN
  RETURN public.is_admin(user_id);
END;
$function$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_backward_compat(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_validation_attempt(uuid, text, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_rate_limited(uuid, integer, integer, text) TO authenticated;

-- Add cache invalidation trigger for user profile changes that affect admin status
CREATE OR REPLACE FUNCTION public.invalidate_admin_cache()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- In a real implementation, this would clear a cache entry
  -- This is a placeholder for where cache invalidation would occur
  RETURN NEW;
END;
$function$;

CREATE TRIGGER invalidate_admin_cache_trigger
  AFTER UPDATE OF role ON public.user_profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.invalidate_admin_cache();
