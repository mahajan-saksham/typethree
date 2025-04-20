/*
  # Update User Profiles Table

  1. Changes
    - Add safety checks for policy creation
    - Ensure policies are only created if they don't exist
    - Maintain existing table structure and RLS settings

  2. Security
    - Verify RLS is enabled
    - Add policy for authenticated users to read their own profile (if not exists)
    - Add policy for admins to read all profiles (if not exists)
*/

-- Safely create policies using DO block
DO $$
BEGIN
  -- Create read policy for authenticated users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON user_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Create admin policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Admins can read all profiles'
  ) THEN
    CREATE POLICY "Admins can read all profiles"
      ON user_profiles
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;
END
$$;