// Script to create required Supabase storage buckets
const { createClient } = require('@supabase/supabase-js');

// Use the same credentials from your supabaseClient.ts file
const supabaseUrl = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzY1ODQsImV4cCI6MjA1OTI1MjU4NH0.seU-MjLZ3ze6b22InyZA-SCPg64fVPTC8Lnnnj0-Aps';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRequiredBuckets() {
  console.log('Checking existing storage buckets...');
  
  try {
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log(`Found ${buckets.length} existing buckets:`, buckets.map(b => b.name).join(', '));
    
    // Check if products bucket exists
    const hasProductsBucket = buckets.some(bucket => bucket.name === 'products');
    
    if (!hasProductsBucket) {
      console.log('Creating products bucket...');
      
      const { data, error: createError } = await supabase.storage.createBucket('products', {
        public: true, // Make it public so images can be accessed without authentication
        fileSizeLimit: 5242880 // 5MB file size limit
      });
      
      if (createError) {
        console.error('Error creating products bucket:', createError);
      } else {
        console.log('✅ Products bucket created successfully!');
      }
    } else {
      console.log('Products bucket already exists!');
    }
    
    // Check if the bucket has the right permissions
    if (hasProductsBucket) {
      console.log('Updating products bucket to ensure it\'s public...');
      
      const { error: updateError } = await supabase.storage.updateBucket('products', {
        public: true // Ensure it's public
      });
      
      if (updateError) {
        console.error('Error updating products bucket:', updateError);
      } else {
        console.log('✅ Products bucket updated to be public!');
      }
    }
    
    // Set CORS policy for the bucket to allow images to be loaded from any origin
    console.log('Setting CORS policy for products bucket...');
    // Note: This might require admin permissions, so it might not work with anon key
    try {
      // Try to set CORS policy if the API supports it
      // This might not be available through the JS client
      console.log('Note: CORS policy might need to be set manually in the Supabase dashboard');
    } catch (corsError) {
      console.warn('Could not set CORS policy programmatically. Please set it in the Supabase dashboard if needed.');
    }
    
    console.log('\nStorage setup complete! If images still don\'t load, please:');
    console.log('1. Check CORS settings in the Supabase dashboard');
    console.log('2. Ensure the storage bucket "products" is set to public');
    console.log('3. Verify the image paths in your database match the storage structure');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createRequiredBuckets();
