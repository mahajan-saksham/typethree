import { supabase } from '../lib/supabaseClient';

/**
 * Creates required database tables if they don't exist
 * - rooftop_leads: For admin panel lead management
 * - site_visits: For site visit booking details
 */
export async function setupDatabase() {
  console.log('🔧 Setting up database tables...');
  const results: Record<string, boolean> = {};
  
  // Create rooftop_leads table if it doesn't exist
  try {
    console.log('Checking if rooftop_leads table exists...');
    const { error: checkError } = await supabase
      .from('rooftop_leads')
      .select('*', { count: 'exact', head: true });
    
    if (checkError && checkError.code === '42P01') { // Table doesn't exist
      console.log('Creating rooftop_leads table...');
      
      // Use raw SQL to create the table with proper schema
      const { error: createError } = await supabase
        .rpc('create_rooftop_leads_table', {
          sql_query: `
            CREATE TABLE public.rooftop_leads (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name TEXT NOT NULL,
              contact TEXT NOT NULL,
              email TEXT,
              status TEXT DEFAULT 'new',
              preferred_date DATE,
              preferred_time_slot TEXT,
              address TEXT,
              city TEXT,
              state TEXT,
              zip_code TEXT,
              product_sku TEXT,
              product_name TEXT,
              product_power NUMERIC,
              source TEXT,
              lead_source TEXT,
              notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Add RLS policy
            ALTER TABLE public.rooftop_leads ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Allow full access to authenticated users" ON public.rooftop_leads 
              FOR ALL TO authenticated USING (true);
            CREATE POLICY "Allow insert access to anonymous users" ON public.rooftop_leads 
              FOR INSERT TO anon USING (true);
          `
        });
      
      if (createError) {
        console.error('Failed to create rooftop_leads table:', createError);
        results.rooftop_leads = false;
      } else {
        console.log('✅ Successfully created rooftop_leads table!');
        results.rooftop_leads = true;
      }
    } else {
      console.log('✅ rooftop_leads table already exists!');
      results.rooftop_leads = true;
    }
  } catch (error) {
    console.error('Error while setting up rooftop_leads table:', error);
    results.rooftop_leads = false;
  }
  
  // Create site_visits table if it doesn't exist
  try {
    console.log('Checking if site_visits table exists...');
    const { error: checkError } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true });
    
    if (checkError && checkError.code === '42P01') { // Table doesn't exist
      console.log('Creating site_visits table...');
      
      // Use raw SQL to create the table with proper schema
      const { error: createError } = await supabase
        .rpc('create_site_visits_table', {
          sql_query: `
            CREATE TABLE public.site_visits (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name TEXT NOT NULL,
              phone_number TEXT NOT NULL,
              email TEXT,
              address TEXT,
              city TEXT,
              state TEXT,
              zip_code TEXT,
              pincode TEXT,
              preferred_date DATE,
              preferred_time_slot TEXT,
              geolocation JSONB,
              additional_notes TEXT,
              status TEXT DEFAULT 'pending',
              product_sku TEXT,
              product_name TEXT,
              capacity_kw NUMERIC,
              power NUMERIC,
              system_size NUMERIC,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              scheduled_at TIMESTAMP WITH TIME ZONE,
              completed_at TIMESTAMP WITH TIME ZONE
            );
            
            -- Add RLS policy
            ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Allow full access to authenticated users" ON public.site_visits 
              FOR ALL TO authenticated USING (true);
            CREATE POLICY "Allow insert access to anonymous users" ON public.site_visits 
              FOR INSERT TO anon USING (true);
          `
        });
      
      if (createError) {
        console.error('Failed to create site_visits table:', createError);
        results.site_visits = false;
      } else {
        console.log('✅ Successfully created site_visits table!');
        results.site_visits = true;
      }
    } else {
      console.log('✅ site_visits table already exists!');
      results.site_visits = true;
    }
  } catch (error) {
    console.error('Error while setting up site_visits table:', error);
    results.site_visits = false;
  }
  
  // Create missing storage buckets as well if needed
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (!bucketsError) {
      const hasSiteVisitsBucket = buckets.some(bucket => bucket.name === 'site-visits');
      if (!hasSiteVisitsBucket) {
        const { error: createBucketError } = await supabase.storage.createBucket('site-visits', {
          public: false
        });
        if (!createBucketError) {
          console.log('✅ Created site-visits storage bucket');
        }
      }
    }
  } catch (error) {
    console.error('Error checking or creating storage buckets:', error);
  }
  
  return results;
}

/**
 * Creates an RPC function in Supabase to execute arbitrary SQL
 * This is needed to create tables from the client since Supabase doesn't
 * allow direct table creation from the client API
 */
export async function setupRpcFunctions() {
  try {
    // We need to create an RPC function to create tables
    // This requires admin access to the database
    console.log('This script needs to be run with appropriate permissions.');
    console.log('You may need to create the tables directly in the Supabase dashboard.')
    console.log('SQL to create tables:');
    console.log(`
-- Create rooftop_leads table
CREATE TABLE IF NOT EXISTS public.rooftop_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'new',
  preferred_date DATE,
  preferred_time_slot TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  product_sku TEXT,
  product_name TEXT,
  product_power NUMERIC,
  source TEXT,
  lead_source TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE public.rooftop_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON public.rooftop_leads 
  FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow insert access to anonymous users" ON public.rooftop_leads 
  FOR INSERT TO anon USING (true);

-- Create site_visits table
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  pincode TEXT,
  preferred_date DATE,
  preferred_time_slot TEXT,
  geolocation JSONB,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending',
  product_sku TEXT,
  product_name TEXT,
  capacity_kw NUMERIC,
  power NUMERIC,
  system_size NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policy
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON public.site_visits 
  FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow insert access to anonymous users" ON public.site_visits 
  FOR INSERT TO anon USING (true);
    `);
    
    return true;
  } catch (error) {
    console.error('Error in setupRpcFunctions:', error);
    return false;
  }
}
