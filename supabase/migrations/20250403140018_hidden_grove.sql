/*
  # Create ROI Calculator Logs Table

  1. New Tables
    - `roi_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references auth.users)
      - `calculator_type` (text, either 'rooftop' or 'investment')
      - `input_data` (jsonb, stores calculator inputs)
      - `results` (jsonb, stores calculation results)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `roi_logs` table
    - Add policy for authenticated users to read their own logs
    - Add policy for anonymous users to create logs
*/

CREATE TABLE IF NOT EXISTS roi_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  calculator_type text NOT NULL CHECK (calculator_type IN ('rooftop', 'investment')),
  input_data jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roi_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own logs
CREATE POLICY "Users can read own logs"
  ON roi_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous users to create logs
CREATE POLICY "Anyone can create logs"
  ON roi_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);