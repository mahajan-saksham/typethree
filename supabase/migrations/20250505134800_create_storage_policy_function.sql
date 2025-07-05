-- Create a function to manage storage policies
CREATE OR REPLACE FUNCTION public.create_storage_policies()
RETURNS void AS $$
BEGIN
  -- First ensure the bucket exists
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('productphotos', 'productphotos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
  
  -- Remove any existing policies for this bucket using the storage API
  DELETE FROM storage.policies WHERE bucket_id = 'productphotos';
  
  -- Create policy for public read access
  INSERT INTO storage.policies 
    (name, bucket_id, operation, permission, definition)
  VALUES 
    ('Public Read Access', 'productphotos', 'SELECT', 'policy', 'true');
  
  -- Create policy for authenticated users to insert
  INSERT INTO storage.policies 
    (name, bucket_id, operation, permission, definition)
  VALUES 
    ('Admin Insert Access', 'productphotos', 'INSERT', 'policy', 'auth.role() = ''authenticated''');
  
  -- Create policy for authenticated users to update
  INSERT INTO storage.policies 
    (name, bucket_id, operation, permission, definition)
  VALUES 
    ('Admin Update Access', 'productphotos', 'UPDATE', 'policy', 'auth.role() = ''authenticated''');
  
  -- Create policy for authenticated users to delete
  INSERT INTO storage.policies 
    (name, bucket_id, operation, permission, definition)
  VALUES 
    ('Admin Delete Access', 'productphotos', 'DELETE', 'policy', 'auth.role() = ''authenticated''');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT public.create_storage_policies();

-- Clean up (optional - remove the function if you don't need it anymore)
-- DROP FUNCTION public.create_storage_policies();
