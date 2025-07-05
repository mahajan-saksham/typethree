import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the migrations directory
const projectRoot = path.resolve(__dirname, '..');
const migrationsDir = path.join(projectRoot, 'supabase/migrations');

// Get all SQL files in the migrations directory
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .map(file => path.join(migrationsDir, file));

console.log(`Found ${migrationFiles.length} migration files to process`);

// Common SQL keywords that should have a newline before them
const sqlKeywords = [
  'CREATE TABLE', 'ALTER TABLE', 'CREATE POLICY', 'CREATE TYPE', 'CREATE INDEX',
  'INSERT INTO', 'DROP TABLE', 'DO $$', 'END$$', 'BEGIN', 'END IF'
];

// Process each file
for (const filePath of migrationFiles) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const originalContent = content;
    
    // First remove all escaped newlines
    content = content.replace(/\\n/g, ' ');
    
    // Add proper newlines before SQL keywords
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(`([^\n])${keyword}`, 'g');
      content = content.replace(regex, `$1\n${keyword}`);
    });
    
    // Add newlines after semicolons
    content = content.replace(/;([^\n])/g, ';\n$1');
    
    // Fix specific common issues
    // Fix SQL comments with no space after --
    content = content.replace(/--([A-Za-z])/g, '-- $1');
    
    // Fix DO block formatting
    content = content.replace(/DO \$\$\nBEGIN/g, 'DO $$\nBEGIN');
    content = content.replace(/END IF;\n  --/g, 'END IF;\n\n  --');
    
    // Add space after keywords
    content = content.replace(/CREATE TABLE(?!\s)/g, 'CREATE TABLE ');
    content = content.replace(/ALTER TABLE(?!\s)/g, 'ALTER TABLE ');
    content = content.replace(/CREATE POLICY(?!\s)/g, 'CREATE POLICY ');
    
    // Handle special case for 20250404073130_black_cliff.sql
    if (fileName === '20250404073130_black_cliff.sql') {
      // Completely rewrite this file with proper formatting
      content = `-- Create table if it doesn't exist\nCREATE TABLE IF NOT EXISTS user_profiles (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id uuid REFERENCES auth.users NOT NULL,\n  full_name text NOT NULL,\n  role text NOT NULL CHECK (role IN ('user', 'investor', 'admin')),\n  created_at timestamptz DEFAULT now()\n);\n\n-- Enable RLS\nALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;\n\n-- Safely create policies using DO block\nDO $$\nBEGIN\n  -- Create read policy for authenticated users if it doesn't exist\n  IF NOT EXISTS (\n    SELECT 1 FROM pg_policies \n    WHERE tablename = 'user_profiles'\n    AND policyname = 'Users can read own profile'\n  ) THEN\n    CREATE POLICY "Users can read own profile"\n      ON user_profiles\n      FOR SELECT\n      TO authenticated\n      USING (auth.uid() = user_id);\n  END IF;\n\n  -- Create admin policy if it doesn't exist\n  IF NOT EXISTS (\n    SELECT 1 FROM pg_policies \n    WHERE tablename = 'user_profiles'\n    AND policyname = 'Admins can read all profiles'\n  ) THEN\n    CREATE POLICY "Admins can read all profiles"\n      ON user_profiles\n      FOR ALL\n      TO authenticated\n      USING (\n        EXISTS (\n          SELECT 1 FROM user_profiles\n          WHERE user_id = auth.uid()\n          AND role = 'admin'\n        )\n      );\n  END IF;\nEND$$;`;
    }
    
    // Handle special case for 20250404073001_wild_art.sql
    if (fileName === '20250404073001_wild_art.sql') {
      // Completely rewrite this file with proper formatting
      content = `-- Create user profiles table\nCREATE TABLE IF NOT EXISTS user_profiles (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id uuid REFERENCES auth.users NOT NULL,\n  full_name text NOT NULL,\n  role text NOT NULL CHECK (role IN ('user', 'investor', 'admin')),\n  created_at timestamptz DEFAULT now()\n);\n\n-- Enable RLS\nALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;\n\n-- Allow users to read their own profile\nCREATE POLICY "Users can read own profile"\n  ON user_profiles\n  FOR SELECT\n  TO authenticated\n  USING (auth.uid() = user_id);\n\n-- Allow admins to read all profiles\nCREATE POLICY "Admins can read all profiles"\n  ON user_profiles\n  FOR ALL\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM user_profiles\n      WHERE user_id = auth.uid()\n      AND role = 'admin'\n    )\n  );`;
    }
    
    // Handle special case for 20250405064246_misty_darkness.sql
    if (fileName === '20250405064246_misty_darkness.sql') {
      // Check content first
      if (content.includes('mistydarkness')) {
        // Completely rewrite this file with proper formatting
        content = `-- Create orders table\nCREATE TABLE IF NOT EXISTS orders (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id uuid REFERENCES auth.users NOT NULL,\n  product_id uuid NOT NULL,\n  quantity int NOT NULL,\n  total_amount numeric NOT NULL,\n  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),\n  created_at timestamptz DEFAULT now(),\n  updated_at timestamptz DEFAULT now()\n);\n\n-- Enable RLS\nALTER TABLE orders ENABLE ROW LEVEL SECURITY;\n\n-- Users can read their own orders\nCREATE POLICY "Users can read own orders"\n  ON orders\n  FOR SELECT\n  TO authenticated\n  USING (auth.uid() = user_id);\n\n-- Users can insert their own orders\nCREATE POLICY "Users can insert own orders"\n  ON orders\n  FOR INSERT\n  TO authenticated\n  WITH CHECK (auth.uid() = user_id);`;
      }
    }
    
    // Write the content back to the file if it was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed syntax in file: ${fileName}`);
    } else {
      console.log(`✓ No changes made to file: ${fileName}`);
    }
  } catch (error) {
    console.error(`❌ Error processing file ${path.basename(filePath)}:`, error.message);
  }
}

console.log('Migration files processing complete!');
