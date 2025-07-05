// Script to directly configure storage policies for productphotos bucket
const { createClient } = require('@supabase/supabase-js');

// Project configuration
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.MZlirwPpVj6Q3E0nVUEn_wEF7Y97XjNvbUgBh7eRSCY';

// Create Supabase client with service role key for admin operations
// Must use the special admin options when using the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create another client specifically for storage operations
const storageAdmin = supabase.storage;

async function setupStoragePolicies() {
  console.log('Setting up storage policies for productphotos bucket...');
  
  try {
    // First, ensure the bucket exists
    let { data: buckets, error: bucketsError } = await storageAdmin.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'productphotos');
    
    if (!bucketExists) {
      console.log('Creating productphotos bucket...');
      const { error: createError } = await storageAdmin.createBucket('productphotos', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      
      console.log('✅ Bucket created successfully!');
    } else {
      console.log('Bucket already exists, updating to be public...');
      
      const { error: updateError } = await storageAdmin.updateBucket('productphotos', {
        public: true
      });
      
      if (updateError) {
        console.error('Error updating bucket:', updateError);
        return;
      }
      
      console.log('✅ Bucket updated successfully!');
    }
    
    // Now create the policies
    // Note: The Storage API doesn't directly expose policy management functions
    // So we'll have to use the REST API to create policies
    
    // Now let's create the necessary policies using the REST API and PostgreSQL directly
    console.log('Creating storage policies using PostgreSQL...');
    
    // Execute raw SQL to create the policies
    // This bypasses the standard API since the Storage API doesn't expose policy management
    console.log('Creating SELECT policy (public read access)...');
    const { error: selectError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'productphotos',
      policy_name: 'Public Read Access',
      operation: 'SELECT',
      policy_definition: 'true'
    });
    
    if (selectError) {
      console.error('Error creating SELECT policy:', selectError);
      console.log('Attempting alternative method...');
      
      // Try direct SQL execution as backup method
      const { error: sqlError } = await supabase.from('_temp_create_policy').insert({
        bucket: 'productphotos',
        policy_name: 'Public Read Access',
        definition: 'true',
        operation: 'SELECT'
      }).select();
      
      if (sqlError) {
        console.error('SQL Error:', sqlError);
      }
    } else {
      console.log('✅ Public read access policy created successfully!');
    }
    
    // Create INSERT policy for authenticated users
    console.log('Creating INSERT policy...');
    await supabase.rpc('create_storage_policy', {
      bucket_name: 'productphotos',
      policy_name: 'Admin Insert Access',
      operation: 'INSERT',
      policy_definition: "auth.role() = 'authenticated'"
    });
    
    // Create UPDATE policy for authenticated users
    console.log('Creating UPDATE policy...');
    await supabase.rpc('create_storage_policy', {
      bucket_name: 'productphotos',
      policy_name: 'Admin Update Access',
      operation: 'UPDATE',
      policy_definition: "auth.role() = 'authenticated'"
    });
    
    // Create DELETE policy for authenticated users
    console.log('Creating DELETE policy...');
    await supabase.rpc('create_storage_policy', {
      bucket_name: 'productphotos',
      policy_name: 'Admin Delete Access',
      operation: 'DELETE',
      policy_definition: "auth.role() = 'authenticated'"
    });
    
    console.log('\nStorage policy setup attempts complete.');
    console.log('If you see errors above, you may need to create the policies manually:');
    console.log('1. Navigate to the Supabase dashboard > Storage > Policies');
    console.log('2. Create the following policies for the productphotos bucket:');
    console.log('   a. Policy Name: "Public Read Access"');
    console.log('      - Operation: SELECT');
    console.log('      - Policy Definition: true');
    console.log('   b. Policy Name: "Admin Insert Access"');
    console.log('      - Operation: INSERT');
    console.log('      - Policy Definition: auth.role() = \'authenticated\'');
    console.log('   c. Policy Name: "Admin Update Access"');
    console.log('      - Operation: UPDATE');
    console.log('      - Policy Definition: auth.role() = \'authenticated\'');
    console.log('   d. Policy Name: "Admin Delete Access"');
    console.log('      - Operation: DELETE');
    console.log('      - Policy Definition: auth.role() = \'authenticated\'');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupStoragePolicies();
