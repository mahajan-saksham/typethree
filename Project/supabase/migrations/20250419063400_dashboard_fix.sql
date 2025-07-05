-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('investor', 'rooftop')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": true,
    "investment": true,
    "payout": true,
    "news": false
  }'::jsonb
);

-- Create investments table if it doesn't exist
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  investment_type TEXT DEFAULT 'solar',
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_roi NUMERIC DEFAULT 0.12, -- 12% annual return as default
  notes TEXT
);

-- Create wattage_credits table if it doesn't exist
CREATE TABLE IF NOT EXISTS wattage_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month TEXT NOT NULL, -- Format: 'YYYY-MM'
  kwh NUMERIC DEFAULT 0,
  payout_rate NUMERIC DEFAULT 7.5,
  status TEXT CHECK (status IN ('pending', 'available', 'redeemed', 'reinvested')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchase_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id TEXT,
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'refunded', 'failed')) DEFAULT 'completed',
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'pending'
);

-- Create support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_to TEXT
);

-- Create security_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT false,
  login_notifications BOOLEAN DEFAULT true,
  last_password_change TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view and update their own profiles
CREATE POLICY "Users can view own profiles" 
  ON user_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" 
  ON user_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for investments
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investments" 
  ON investments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add RLS policies for wattage_credits
ALTER TABLE wattage_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" 
  ON wattage_credits 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add RLS policies for purchase_history
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" 
  ON purchase_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add RLS policies for support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" 
  ON support_tickets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" 
  ON support_tickets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for security_settings
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own security settings" 
  ON security_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings" 
  ON security_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for ticket_messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ticket messages they are involved with" 
  ON ticket_messages 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM support_tickets WHERE id = ticket_id
    )
  );

CREATE POLICY "Users can create ticket messages" 
  ON ticket_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add admin policies to allow admins to view and manage all tickets
CREATE POLICY "Admins can view all tickets" 
  ON support_tickets 
  FOR SELECT 
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can update all tickets" 
  ON support_tickets 
  FOR UPDATE 
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can view all ticket messages" 
  ON ticket_messages 
  FOR SELECT 
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can create ticket messages" 
  ON ticket_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin')
  );

-- Insert sample data for testing
INSERT INTO user_profiles (user_id, full_name, email, role, created_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  email,
  COALESCE(raw_user_meta_data->>'role', 'investor'),
  created_at
FROM
  auth.users
ON CONFLICT (id) DO NOTHING;
