-- Migration to add storage policies for the productphotos bucket
-- This ensures admin users have complete access to manage product images

-- First, ensure the bucket exists (will not create if it already exists)
BEGIN;

-- Create the productphotos bucket if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'productphotos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('productphotos', 'productphotos', true);
  END IF;
END
$$;

-- Clear any existing policies for the productphotos bucket
DELETE FROM storage.policies
WHERE bucket_id = 'productphotos';

-- Add policy for SELECT operations (anyone can view images)
INSERT INTO storage.policies (bucket_id, name, permission, definition)
VALUES
  ('productphotos', 'Public Read Access', 'SELECT', 'true');

-- Add policy for INSERT operations (only authenticated users can upload)
INSERT INTO storage.policies (bucket_id, name, permission, definition)
VALUES
  ('productphotos', 'Admin Insert Access', 'INSERT', 'auth.role() = ''authenticated''');

-- Add policy for UPDATE operations (only authenticated users can update)
INSERT INTO storage.policies (bucket_id, name, permission, definition)
VALUES
  ('productphotos', 'Admin Update Access', 'UPDATE', 'auth.role() = ''authenticated''');

-- Add policy for DELETE operations (only authenticated users can delete)
INSERT INTO storage.policies (bucket_id, name, permission, definition)
VALUES
  ('productphotos', 'Admin Delete Access', 'DELETE', 'auth.role() = ''authenticated''');

COMMIT;