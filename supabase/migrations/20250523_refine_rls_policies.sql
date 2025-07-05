-- Migration: Refine Row Level Security Policies
-- This migration standardizes and enhances RLS policies across the platform

-- 1. Standardize admin role checking

-- 1.1 Update product_categories policy to use the is_admin function
DROP POLICY IF EXISTS "Admins can manage product categories" ON product_categories;
CREATE POLICY "Admins can manage product categories"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 1.2 Update product_skus policy to use the is_admin function
DROP POLICY IF EXISTS "Admins can manage products" ON product_skus;
CREATE POLICY "Admins can manage products"
  ON product_skus
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 1.3 Update product_variants policy to use the is_admin function
DROP POLICY IF EXISTS "Admins can manage product variants" ON product_variants;
CREATE POLICY "Admins can manage product variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 1.4 Update user_profiles admin policy to use the is_admin function
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 2. Remove temporary permissive storage policies

DROP POLICY IF EXISTS "Temporary - Allow any authenticated user to upload to productphotos" ON storage.objects;
DROP POLICY IF EXISTS "Temporary - Allow any authenticated user to update in productphotos" ON storage.objects;
DROP POLICY IF EXISTS "Temporary - Allow any authenticated user to delete from productphotos" ON storage.objects;

-- 3. Create more granular policies for user_profiles

-- 3.1 Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3.2 Prevent users from changing their role
CREATE POLICY IF NOT EXISTS "Users cannot change their role"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    (OLD.role = NEW.role OR public.is_admin(auth.uid()))
  );

-- 4. Ensure RLS is enabled on all persistent task tables and validate policies

-- First check if RLS is enabled on task persistence tables, enable if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'persistent_tasks' AND rowsecurity = true
  ) THEN
    ALTER TABLE public.persistent_tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.persistent_task_dependencies ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.persistent_subtasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.persistent_subtask_dependencies ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.persistent_task_comments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.persistent_task_history ENABLE ROW LEVEL SECURITY;
    
    -- Recreate basic read policies
    CREATE POLICY "Allow authenticated users to read all tasks"
      ON public.persistent_tasks
      FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Allow authenticated users to read all task dependencies"
      ON public.persistent_task_dependencies
      FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Allow authenticated users to read all subtasks"
      ON public.persistent_subtasks
      FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Allow authenticated users to read all subtask dependencies"
      ON public.persistent_subtask_dependencies
      FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Allow authenticated users to read all task comments"
      ON public.persistent_task_comments
      FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Allow authenticated users to read task history"
      ON public.persistent_task_history
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END$$;

-- 5. Fix log_security_event function to have better input validation

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
  v_valid_user BOOLEAN;
BEGIN
  -- Enhanced input validation
  -- Check if user_id exists in auth.users
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM auth.users WHERE id = p_user_id
    ) INTO v_valid_user;
    
    IF NOT v_valid_user THEN
      RAISE EXCEPTION 'Invalid user_id provided to log_security_event';
    END IF;
  END IF;
  
  -- Validate event_type is not empty
  IF p_event_type IS NULL OR p_event_type = '' THEN
    RAISE EXCEPTION 'Event type cannot be empty';
  END IF;
  
  -- Sanitize p_ip_address (basic check)
  IF p_ip_address IS NOT NULL AND length(p_ip_address) > 45 THEN
    p_ip_address := substr(p_ip_address, 1, 45);
  END IF;
  
  -- Sanitize p_user_agent (basic check)
  IF p_user_agent IS NOT NULL AND length(p_user_agent) > 500 THEN
    p_user_agent := substr(p_user_agent, 1, 500);
  END IF;
  
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
EXCEPTION WHEN OTHERS THEN
  -- Graceful error handling
  RAISE WARNING 'Error in log_security_event: %', SQLERRM;
  RETURN NULL;
END;
$$;

-- 6. Create a function to test and verify RLS policies

CREATE OR REPLACE FUNCTION public.test_rls_policy(
  p_table_name TEXT,
  p_policy_name TEXT,
  p_test_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_policy_exists BOOLEAN;
  v_result BOOLEAN;
BEGIN
  -- Check if policy exists
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = p_table_name AND policyname = p_policy_name
  ) INTO v_policy_exists;
  
  IF NOT v_policy_exists THEN
    RAISE WARNING 'Policy % does not exist on table %', p_policy_name, p_table_name;
    RETURN FALSE;
  END IF;
  
  -- Additional policy verification could be added here
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error testing policy % on table %: %', p_policy_name, p_table_name, SQLERRM;
  RETURN FALSE;
END;
$$;

-- 7. Function to identify tables missing RLS

CREATE OR REPLACE FUNCTION public.find_tables_missing_rls()
RETURNS TABLE (schema_name TEXT, table_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT n.nspname::TEXT AS schema_name, c.relname::TEXT AS table_name
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind = 'r' -- Only tables
  AND n.nspname = 'public' -- Only public schema
  AND NOT c.relrowsecurity -- Tables without row security
  AND c.relname NOT IN (
    -- Exclude certain tables that don't need RLS
    'schema_migrations',
    'spatial_ref_sys'
  );
END;
$$;
