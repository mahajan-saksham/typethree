/**
 * One-time script to set up user_profiles table and create profiles for existing users
 * 
 * Usage:
 * 1. Make sure you have the correct Supabase credentials in your .env file
 * 2. Run this script with Node.js: node src/scripts/setupUserProfiles.js
 * 3. After running, test by checking the user_profiles table in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Initialize readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get Supabase URL and service role key (this needs admin privileges)
const getCredentials = () => new Promise((resolve) => {
  console.log('\n=== Type 3 Solar Platform - User Profiles Setup ===\n');
  console.log('This script will:');
  console.log('1. Set up the user_profiles table if it doesn\'t exist');
  console.log('2. Create profiles for all existing users');
  console.log('3. Set up a trigger for automatic profile creation');
  console.log('\nYou\'ll need Supabase admin credentials to continue.\n');
  
  rl.question('Supabase URL (e.g., https://dtuoyawpebjcmfesgwwn.supabase.co): ', (url) => {
    rl.question('Supabase Service Role Key (from API settings): ', (key) => {
      rl.question('Your user ID to make admin (from auth.users table): ', (adminId) => {
        resolve({ url, key, adminId });
      });
    });
  });
});

// Main function
async function main() {
  try {
    // Get credentials
    const { url, key, adminId } = await getCredentials();
    
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(url, key);
    
    console.log('\nConnecting to Supabase...');
    
    // 1. Check if user_profiles table exists and create it if needed
    console.log('\nChecking if user_profiles table exists...');
    
    // This will run raw SQL to create the table if it doesn't exist
    const { error: tableError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.user_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
          full_name TEXT,
          email TEXT,
          phone TEXT,
          role TEXT DEFAULT 'user',
          kyc_status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Add Row Level Security
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (tableError) {
      console.error('Error creating table:', tableError);
      // Try alternative approach with raw SQL
      const { error: rawError } = await supabase
        .from('user_profiles')
        .select('count(*)');
      
      if (rawError && rawError.code === '42P01') { // Table doesn't exist
        console.log('Creating user_profiles table with direct SQL...');
        // Use direct SQL if the table doesn't exist at all
        await setupTableManually(supabase);
      } else {
        throw tableError;
      }
    } else {
      console.log('User profiles table is ready.');
    }
    
    // 2. Set up RLS policies
    console.log('\nSetting up row-level security policies...');
    await setupRlsPolicies(supabase);
    
    // 3. Create trigger function and trigger
    console.log('\nSetting up automatic profile creation trigger...');
    await setupTrigger(supabase);
    
    // 4. Backfill existing users
    console.log('\nCreating profiles for existing users...');
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email');
      
    if (usersError) {
      console.log('Trying alternative approach to fetch users...');
      const { data: userData, error: userDataError } = await supabase.auth.admin.listUsers();
      
      if (userDataError) {
        throw userDataError;
      }
      
      // Process users
      await backfillUsers(supabase, userData.users);
    } else {
      // Process users
      await backfillUsers(supabase, users);
    }
    
    // 5. Make specified user an admin
    if (adminId) {
      console.log(`\nMaking user ${adminId} an admin...`);
      const { error: adminError } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('user_id', adminId);
        
      if (adminError) {
        console.error('Error making user admin:', adminError);
      } else {
        console.log('✅ Admin user created successfully!');
      }
    }
    
    console.log('\n✅ Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Log out and log back in to your account');
    console.log('2. Try accessing the admin dashboard at /admin');
    console.log('3. Check the user_profiles table in Supabase to verify everything is correct\n');
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error);
  } finally {
    rl.close();
  }
}

// Helper functions
async function setupTableManually(supabase) {
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE public.user_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL UNIQUE,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        kyc_status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );
      
      -- Add foreign key if possible
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE public.user_profiles 
          ADD CONSTRAINT user_profiles_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        EXCEPTION
          WHEN others THEN
            RAISE NOTICE 'Could not add foreign key constraint, continuing anyway';
        END;
      END $$;
      
      -- Add RLS
      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    `
  });
  
  if (error) {
    throw error;
  }
  
  console.log('User profiles table created successfully.');
}

async function setupRlsPolicies(supabase) {
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      -- Create policies (drop existing ones first to avoid conflicts)
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
      DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
      DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.user_profiles;
      DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.user_profiles;
      
      CREATE POLICY "Users can view their own profile" 
        ON public.user_profiles FOR SELECT 
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can update their own profile" 
        ON public.user_profiles FOR UPDATE 
        USING (auth.uid() = user_id);

      CREATE POLICY "Admin users can view all profiles" 
        ON public.user_profiles FOR SELECT 
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
          )
        );

      CREATE POLICY "Admin users can update all profiles" 
        ON public.user_profiles FOR UPDATE 
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
          )
        );
        
      -- Allow inserts with RLS
      DROP POLICY IF EXISTS "Allow inserts" ON public.user_profiles;
      CREATE POLICY "Allow inserts" ON public.user_profiles FOR INSERT WITH CHECK (true);
    `
  });
  
  if (error) {
    console.error('Error setting up RLS policies:', error);
  } else {
    console.log('RLS policies set up successfully.');
  }
}

async function setupTrigger(supabase) {
  const { error: functionError } = await supabase.rpc('exec_sql', {
    query: `
      -- Function to create a profile when a user signs up
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.user_profiles (user_id, full_name, email)
        VALUES (
          NEW.id,
          NEW.raw_user_meta_data->>'full_name',
          NEW.email
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });
  
  if (functionError) {
    console.error('Error creating trigger function:', functionError);
    return;
  }
  
  const { error: triggerError } = await supabase.rpc('exec_sql', {
    query: `
      -- Trigger the function every time a user is created
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
  });
  
  if (triggerError) {
    console.error('Error creating trigger:', triggerError);
  } else {
    console.log('Trigger set up successfully.');
  }
}

async function backfillUsers(supabase, users) {
  if (!users || users.length === 0) {
    console.log('No users found to backfill.');
    return;
  }
  
  console.log(`Found ${users.length} users to process.`);
  
  // Get existing profiles to avoid duplicates
  const { data: existingProfiles } = await supabase
    .from('user_profiles')
    .select('user_id');
    
  const existingIds = new Set(existingProfiles?.map(p => p.user_id) || []);
  
  // Filter out users who already have profiles
  const usersToCreate = users.filter(user => !existingIds.has(user.id));
  
  if (usersToCreate.length === 0) {
    console.log('All users already have profiles.');
    return;
  }
  
  console.log(`Creating profiles for ${usersToCreate.length} users...`);
  
  // Create profiles in batches to avoid hitting API limits
  const batchSize = 20;
  let successCount = 0;
  
  for (let i = 0; i < usersToCreate.length; i += batchSize) {
    const batch = usersToCreate.slice(i, i + batchSize);
    const profileData = batch.map(user => ({
      user_id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || ''
    }));
    
    const { error } = await supabase
      .from('user_profiles')
      .insert(profileData);
      
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      successCount += batch.length;
      console.log(`Processed batch ${i / batchSize + 1} (${successCount}/${usersToCreate.length})`);
    }
  }
  
  console.log(`✅ Created profiles for ${successCount} users.`);
}

// Run the script
main();
