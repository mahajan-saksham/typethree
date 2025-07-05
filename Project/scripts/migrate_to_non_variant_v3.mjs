import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Migrates from variant structure to non-variant structure
 * 
 * This script:
 * 1. Fetches all products and their variants
 * 2. Updates each product with data from its default variant
 * 3. Provides a detailed report of changes
 */
async function migrateToNonVariantStructure() {
  try {
    console.log('Starting migration to non-variant structure...');
    
    // Step 1: Check if subsidy_percentage column exists in product_skus
    console.log('Checking if subsidy_percentage column exists in product_skus...');
    
    // We'll do this indirectly by checking a product
    const { data: sampleProduct, error: sampleError } = await supabase
      .from('product_skus')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.error(`Error fetching sample product: ${sampleError.message}`);
      return;
    }
    
    const hasSubsidyPercentage = 'subsidy_percentage' in sampleProduct;
    
    if (!hasSubsidyPercentage) {
      console.log('The subsidy_percentage column does not exist in product_skus.');
      console.log('Please add it manually with: ALTER TABLE public.product_skus ADD COLUMN subsidy_percentage NUMERIC DEFAULT 35;');
      console.log('Then run this script again.');
      return;
    }
    
    console.log('The subsidy_percentage column exists in product_skus. Proceeding with migration...');
    
    // Step 2: Fetch all products
    console.log('Fetching all products...');
    const { data: products, error: productsError } = await supabase
      .from('product_skus')
      .select('*');
    
    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }
    
    console.log(`Found ${products.length} products. Processing...`);
    
    // Step 3: Process each product
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        console.log(`Processing product: ${product.name} (${product.id})`);
        
        // Check if this product has a default variant
        if (product.default_variant_id) {
          console.log(`  Product has default variant ID: ${product.default_variant_id}`);
          
          // Fetch the default variant
          const { data: variant, error: variantError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('id', product.default_variant_id)
            .single();
          
          if (variantError) {
            console.error(`  Error fetching default variant: ${variantError.message}`);
            errorCount++;
            continue;
          }
          
          if (!variant) {
            console.warn(`  Default variant not found for product ${product.id}. Trying to find any variant...`);
            
            // Try to find any variant for this product
            const { data: variants, error: variantsError } = await supabase
              .from('product_variants')
              .select('*')
              .eq('product_id', product.id)
              .order('created_at', { ascending: true });
            
            if (variantsError || !variants || variants.length === 0) {
              console.warn(`  No variants found for product ${product.id}. Skipping.`);
              skippedCount++;
              continue;
            }
            
            // Use the first variant
            const firstVariant = variants[0];
            console.log(`  Using first available variant: ${firstVariant.id}`);
            
            // Update product with variant data
            const { error: updateError } = await supabase
              .from('product_skus')
              .update({
                capacity_kw: firstVariant.capacity_kw,
                price: firstVariant.price,
                subsidy_percentage: firstVariant.subsidy_percentage,
                area_required: firstVariant.area_required,
                monthly_savings: firstVariant.monthly_savings,
                installation_time: firstVariant.installation_days
              })
              .eq('id', product.id);
            
            if (updateError) {
              console.error(`  Error updating product: ${updateError.message}`);
              errorCount++;
              continue;
            }
            
            updatedCount++;
            console.log(`  Updated product with variant data successfully.`);
          } else {
            // Update product with default variant data
            const { error: updateError } = await supabase
              .from('product_skus')
              .update({
                capacity_kw: variant.capacity_kw,
                price: variant.price,
                subsidy_percentage: variant.subsidy_percentage,
                area_required: variant.area_required,
                monthly_savings: variant.monthly_savings,
                installation_time: variant.installation_days
              })
              .eq('id', product.id);
            
            if (updateError) {
              console.error(`  Error updating product: ${updateError.message}`);
              errorCount++;
              continue;
            }
            
            updatedCount++;
            console.log(`  Updated product with default variant data successfully.`);
          }
        } else {
          console.log(`  Product has no default variant ID. Trying to find any variant...`);
          
          // Try to find any variant for this product
          const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)
            .order('created_at', { ascending: true });
          
          if (variantsError || !variants || variants.length === 0) {
            console.warn(`  No variants found for product ${product.id}. Skipping.`);
            skippedCount++;
            continue;
          }
          
          // Use the first variant
          const firstVariant = variants[0];
          console.log(`  Using first available variant: ${firstVariant.id}`);
          
          // Update product with variant data
          const { error: updateError } = await supabase
            .from('product_skus')
            .update({
              capacity_kw: firstVariant.capacity_kw,
              price: firstVariant.price,
              subsidy_percentage: firstVariant.subsidy_percentage,
              area_required: firstVariant.area_required,
              monthly_savings: firstVariant.monthly_savings,
              installation_time: firstVariant.installation_days
            })
            .eq('id', product.id);
          
          if (updateError) {
            console.error(`  Error updating product: ${updateError.message}`);
            errorCount++;
            continue;
          }
          
          updatedCount++;
          console.log(`  Updated product with variant data successfully.`);
        }
      } catch (err) {
        console.error(`Error processing product ${product.id}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\nProduct update summary:\n- ${updatedCount} products updated successfully\n- ${skippedCount} products skipped (no variants)\n- ${errorCount} errors encountered`);
    
    console.log('\nMigration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify that all products display correctly with the consolidated data');
    console.log('2. Run SQL commands to remove the variant relationship:');
    console.log('   - ALTER TABLE product_skus DROP CONSTRAINT IF EXISTS fk_product_skus_default_variant;');
    console.log('   - ALTER TABLE product_skus DROP COLUMN IF EXISTS default_variant_id;');
    console.log('3. Once everything is working correctly, you can drop the product_variants table:');
    console.log('   - DROP TABLE public.product_variants CASCADE;');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
}

// Run the migration
migrateToNonVariantStructure().then(() => console.log('Script execution completed.'));
