import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Safely executes SQL statements using RPC
 */
async function executeSql(sql) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { query: sql });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error(`SQL Error: ${err.message}`);
    console.error(`Failed SQL: ${sql}`);
    return { success: false, error: err };
  }
}

/**
 * Migrates from variant structure to non-variant structure
 */
async function migrateToNonVariantStructure() {
  try {
    console.log('Starting migration to non-variant structure...');
    
    // Step 1: Create backups of existing tables
    console.log('Creating backups of existing tables...');
    
    await executeSql(`
      CREATE TABLE IF NOT EXISTS product_skus_backup AS
      SELECT * FROM product_skus;
    `);
    
    await executeSql(`
      CREATE TABLE IF NOT EXISTS product_variants_backup AS
      SELECT * FROM product_variants;
    `);
    
    console.log('Backups created successfully.');
    
    // Step 2: Add subsidy_percentage column to product_skus
    console.log('Adding subsidy_percentage column to product_skus if it doesn\'t exist...');
    
    await executeSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'product_skus' 
          AND column_name = 'subsidy_percentage'
        ) THEN
          ALTER TABLE public.product_skus ADD COLUMN subsidy_percentage NUMERIC DEFAULT 35;
        END IF;
      END
      $$;
    `);
    
    // Step 3: Fetch all products
    console.log('Fetching all products...');
    const { data: products, error: productsError } = await supabase
      .from('product_skus')
      .select('*');
    
    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }
    
    console.log(`Found ${products.length} products. Processing...`);
    
    // Step 4: Process each product
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
    
    // Step 5: Create a compatibility view
    console.log('\nCreating compatibility view for backward compatibility...');
    
    const viewResult = await executeSql(`
      CREATE OR REPLACE VIEW product_variants_view AS
      SELECT 
        id as id,
        id as product_id,
        capacity_kw,
        price,
        COALESCE(subsidy_percentage, 35) as subsidy_percentage,
        area_required,
        monthly_savings,
        installation_time as installation_days,
        true as is_default,
        created_at,
        updated_at
      FROM product_skus;
    `);
    
    if (!viewResult.success) {
      console.error('Failed to create compatibility view. Some features may not work correctly.');
    } else {
      console.log('Compatibility view created successfully.');
    }
    
    // Step 6: Drop the foreign key constraint and default_variant_id column
    console.log('\nRemoving variant relationship from product_skus table...');
    
    await executeSql(`
      ALTER TABLE product_skus
      DROP CONSTRAINT IF EXISTS fk_product_skus_default_variant;
    `);
    
    await executeSql(`
      ALTER TABLE product_skus
      DROP COLUMN IF EXISTS default_variant_id;
    `);
    
    console.log('\nMigration completed successfully!');
    console.log('\nNOTE: The product_variants table has been backed up to product_variants_backup');
    console.log('      You can safely drop the product_variants table once you verify everything works correctly.');
    console.log('      To drop the table, run: DROP TABLE public.product_variants CASCADE;');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
}

// Run the migration
migrateToNonVariantStructure().then(() => console.log('Script execution completed.'));
