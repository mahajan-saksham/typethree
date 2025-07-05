import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzY1ODQsImV4cCI6MjA1OTI1MjU4NH0.seU-MjLZ3ze6b22InyZA-SCPg64fVPTC8Lnnnj0-Aps';

// Create an admin-level Supabase client with the service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Get admin-level access to storage features
 * This allows bypassing RLS policies for admin operations
 */
export const storageAdmin = supabaseAdmin.storage;

/**
 * Create a storage policy for a bucket
 * @param bucketId The ID of the bucket to create a policy for
 * @param policyName The name of the policy
 * @param operation The operation (SELECT, INSERT, UPDATE, DELETE)
 * @param policyDefinition The SQL expression that defines the policy
 */
export async function createStoragePolicy(
  bucketId: string,
  policyName: string,
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  policyDefinition: string
) {
  try {
    // Execute a function that creates a storage policy
    // This requires further implementation on the backend
    const { error } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: bucketId,
      policy_name: policyName,
      operation,
      policy_definition: policyDefinition
    });

    if (error) {
      console.error(`Error creating ${operation} policy:`, error);
      return false;
    }

    console.log(`✅ Created ${operation} policy successfully`);
    return true;
  } catch (error) {
    console.error(`Error in createStoragePolicy:`, error);
    return false;
  }
}

/**
 * Set up all required policies for a storage bucket
 * @param bucketId The ID of the bucket to set up policies for
 */
export async function setupStorageBucket(bucketId: string, isPublic: boolean = true) {
  try {
    // First, ensure the bucket exists
    const { data: buckets, error: bucketsError } = await storageAdmin.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketId);
    
    if (!bucketExists) {
      console.log(`Creating ${bucketId} bucket...`);
      
      const { error: createError } = await storageAdmin.createBucket(bucketId, {
        public: isPublic
      });
      
      if (createError) {
        console.error(`Error creating ${bucketId} bucket:`, createError);
        return false;
      }
      
      console.log(`✅ ${bucketId} bucket created successfully!`);
    } else {
      console.log(`${bucketId} bucket already exists!`);
      
      // Update bucket to ensure it has the right public setting
      const { error: updateError } = await storageAdmin.updateBucket(bucketId, {
        public: isPublic
      });
      
      if (updateError) {
        console.error(`Error updating ${bucketId} bucket:`, updateError);
        return false;
      }
      
      console.log(`✅ ${bucketId} bucket updated successfully!`);
    }

    // Set up policies
    await createStoragePolicy(bucketId, 'Public Read Access', 'SELECT', 'true');
    await createStoragePolicy(bucketId, 'Admin Insert Access', 'INSERT', "auth.role() = 'authenticated'");
    await createStoragePolicy(bucketId, 'Admin Update Access', 'UPDATE', "auth.role() = 'authenticated'");
    await createStoragePolicy(bucketId, 'Admin Delete Access', 'DELETE', "auth.role() = 'authenticated'");
    
    return true;
  } catch (error) {
    console.error('Error in setupStorageBucket:', error);
    return false;
  }
}
