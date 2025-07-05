-- Supabase Storage RLS Policies for productphotos bucket

-- First, drop any existing policies for the productphotos bucket to avoid conflicts
BEGIN;

-- List of policies to drop (adjust as needed based on your existing policies)
DO $$
DECLARE
  _policies TEXT[] := ARRAY[
    'Enable read access for all users',
    'Enable insert access for authenticated users only',
    'Enable update access for owners only',
    'Enable delete access for owners only'
  ];
  _bucket_id TEXT := 'productphotos';
  _policy TEXT;
BEGIN
  FOREACH _policy IN ARRAY _policies
  LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "%s" ON storage.objects;', _policy);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to drop policy: %', _policy;
    END;
  END LOOP;
END;
$$;

-- Create new policies for the productphotos bucket

-- 1. Enable SELECT (read) access for all users
CREATE POLICY "Enable read access for productphotos bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'productphotos');

-- 2. Enable INSERT (upload) access for admins
-- This policy will use the claims to check if user is an admin
CREATE POLICY "Enable insert access for admins in productphotos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'productphotos' AND
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
  );

-- 3. Enable UPDATE access for admins
CREATE POLICY "Enable update access for admins in productphotos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'productphotos' AND
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
  );

-- 4. Enable DELETE access for admins
CREATE POLICY "Enable delete access for admins in productphotos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'productphotos' AND
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
  );

-- 5. For quick testing only (not recommended for production):
-- This creates temporary policies that allow any authenticated user to upload/modify files
-- IMPORTANT: Replace these with more restrictive policies in production
CREATE POLICY "Temporary - Allow any authenticated user to upload to productphotos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'productphotos' AND auth.role() = 'authenticated');

CREATE POLICY "Temporary - Allow any authenticated user to update in productphotos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'productphotos' AND auth.role() = 'authenticated');
  
CREATE POLICY "Temporary - Allow any authenticated user to delete from productphotos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'productphotos' AND auth.role() = 'authenticated');

COMMIT;
