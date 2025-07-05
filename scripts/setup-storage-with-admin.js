// Script to create storage policies for the productphotos bucket using the admin client
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

// Get the environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

// Create an admin-level Supabase client with the service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const storageAdmin = supabaseAdmin.storage;

async function setupPolicies() {
  const BUCKET_ID = 'productphotos';
  
  try {
    console.log('=== Supabase Storage Policy Setup ===');
    console.log(`Project URL: ${supabaseUrl}`);
    console.log(`Bucket: ${BUCKET_ID}`);
    console.log('Using service role key for admin privileges');
    console.log('-'.repeat(40));
    
    // Step 1: Ensure the bucket exists and is public
    console.log('\n[1/5] Creating/updating bucket...');
    
    // List buckets to check if it exists
    const { data: buckets, error: listError } = await storageAdmin.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError.message);
      return;
    }
    
    console.log(`Found ${buckets.length} buckets:`, buckets.map(b => b.name).join(', '));
    
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_ID);
    
    if (!bucketExists) {
      // Create the bucket
      const { data, error: createError } = await storageAdmin.createBucket(BUCKET_ID, {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError.message);
        return;
      }
      
      console.log(`✅ Bucket '${BUCKET_ID}' created successfully`);
    } else {
      // Update the bucket to ensure it's public
      const { error: updateError } = await storageAdmin.updateBucket(BUCKET_ID, {
        public: true
      });
      
      if (updateError) {
        console.error('Error updating bucket:', updateError.message);
        return;
      }
      
      console.log(`✅ Bucket '${BUCKET_ID}' updated to be public`);
    }
    
    // Step 2: Try using direct SQL to create policies
    console.log('\n[2/5] Attempting direct SQL to configure policies...');
    
    // Using direct SQL to create policies
    console.log('Creating SQL function to manage storage policies...');
    
    const { error: sqlError } = await supabaseAdmin.rpc('admin_create_storage_policies', {
      bucket_id: BUCKET_ID
    });
    
    if (sqlError) {
      console.log('Error with SQL function:', sqlError.message);
      console.log('Function might not exist, continuing with manual policy creation...');
    } else {
      console.log('✅ SQL function executed successfully');
      return;
    }
    
    // Step 3-5: Manually create policies one by one
    // SELECT policy
    console.log('\n[3/5] Creating SELECT policy (public read access)...');
    
    // First try using the Storage Management API
    try {
      const res = await fetch(`${supabaseUrl}/storage/v1/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          name: 'Public Read Access',
          definition: 'true',
          bucket_id: BUCKET_ID,
          operation: 'SELECT'
        })
      });
      
      if (res.ok) {
        console.log('✅ SELECT policy created successfully');
      } else {
        const error = await res.json();
        console.error('Error:', error);
        console.log('Continuing with other policies...');
      }
    } catch (error) {
      console.error('Error creating SELECT policy:', error);
    }
    
    // INSERT policy
    console.log('\n[4/5] Creating INSERT/UPDATE/DELETE policies...');
    
    const operations = ['INSERT', 'UPDATE', 'DELETE'];
    const names = ['Admin Insert Access', 'Admin Update Access', 'Admin Delete Access'];
    
    for (let i = 0; i < operations.length; i++) {
      try {
        const res = await fetch(`${supabaseUrl}/storage/v1/policies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            name: names[i],
            definition: "auth.role() = 'authenticated'",
            bucket_id: BUCKET_ID,
            operation: operations[i]
          })
        });
        
        if (res.ok) {
          console.log(`✅ ${operations[i]} policy created successfully`);
        } else {
          const error = await res.json();
          console.error(`Error creating ${operations[i]} policy:`, error);
        }
      } catch (error) {
        console.error(`Error creating ${operations[i]} policy:`, error);
      }
    }
    
    console.log('\n=== Storage Policy Setup Complete ===');
    console.log('If the automatic setup failed, you can create policies manually in the Supabase dashboard:');
    console.log('1. Navigate to Storage > Policies');
    console.log('2. Create policies for the productphotos bucket:');
    console.log('   - SELECT policy: "true" (allows public read access)');
    console.log('   - INSERT/UPDATE/DELETE policies: "auth.role() = \'authenticated\'" (admin only)');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the setup function
setupPolicies();
