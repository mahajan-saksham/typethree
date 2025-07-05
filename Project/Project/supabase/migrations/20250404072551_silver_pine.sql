/*
  # Create Contact Messages Table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email_or_phone` (text, required)
      - `reason` (enum: install, invest, partnership, other)
      - `message` (text, required)
      - `status` (text, default: new)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `contact_messages` table
    - Add policy for anonymous users to create messages
    - Add policy for authenticated users to read their own messages
*/

-- Create contact reason enum type
CREATE TYPE contact_reason AS ENUM ('install', 'invest', 'partnership', 'other');

-- Create contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email_or_phone text NOT NULL,
  reason contact_reason NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create contact messages"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read own messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    email_or_phone = current_user
  );