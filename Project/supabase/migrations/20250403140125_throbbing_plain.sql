/*
  # Update ROI Calculator Logs Table

  1. Changes
    - Add safety checks for policy creation
    - Ensure policies are only created if they don't exist
    - Maintain existing table structure and RLS settings

  2. Security
    - Verify RLS is enabled
    - Add policy for authenticated users to read their own logs (if not exists)
    - Add policy for anonymous users to create logs (if not exists)
*/

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS roi_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  calculator_type text NOT NULL CHECK (calculator_type IN ('rooftop', 'investment')),
  input_data jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roi_logs ENABLE ROW LEVEL SECURITY;

-- Safely create policies using DO block
DO $$
BEGIN
  -- Create read policy for authenticated users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'roi_logs' 
    AND policyname = 'Users can read own logs'
  ) THEN
    CREATE POLICY "Users can read own logs"
      ON roi_logs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Create insert policy for anonymous users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'roi_logs' 
    AND policyname = 'Anyone can create logs'
  ) THEN
    CREATE POLICY "Anyone can create logs"
      ON roi_logs
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END
$$;