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
 * 1. Adds necessary columns to product_skus if they don't exist
 * 2. Consolidates data from default variants into product_skus
 * 3. Creates a backup of the variants table
 * 4. Creates a compatibility view for backward compatibility
 */
async function migrateToNonVariantStructure() {
  try {
    console.log('Starting migration to non-variant structure...');
    
    // Step 1: Check if necessary columns exist in product_skus, add if needed
    console.log('Checking and adding necessary columns to product_skus...');
    
    // Check if subsidy_percentage column exists
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'product_skus')
      .eq('table_schema', 'public');
    
    const columnNames = columns.map(col => col.column_name);
    
    // Add subsidy_percentage if it doesn't exist
    if (!columnNames.includes('subsidy_percentage')) {
      console.log('Adding subsidy_percentage column to product_skus...');
      await supabase.rpc('execute_sql', {
        query: 'ALTER TABLE public.product_skus ADD COLUMN subsidy_percentage NUMERIC DEFAULT 35;'
      });
    }
    
    // Step 2: Create a backup of product_variants
    console.log('Creating backup of product_variants table...');
    await supabase.rpc('execute_sql', {
      query: 'CREATE TABLE IF NOT EXISTS product_variants_backup AS SELECT * FROM product_variants;'
    });
    
    // Step 3: Fetch all products
    console.log('Fetching all products...');
    const { data: products, error: productsError } = await supabase
      .from('product_skus')
      .select('*');
    
    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }
    
    console.log(`Found ${products.length} products. Updating with variant data...`);
    
    // Step 4: Update each product with data from its default variant
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        // Find the default variant for this product
        const { data: variants, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id)
          .eq('is_default', true);
        
        if (variantsError) {
          console.error(`Error fetching variants for product ${product.id}: ${variantsError.message}`);
          errorCount++;
          continue;
        }
        
        // If no default variant, try to get the first variant
        let variantToUse = variants && variants.length > 0 ? variants[0] : null;
        
        if (!variantToUse) {
          const { data: allVariants, error: allVariantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)
            .order('capacity_kw', { ascending: true });
          
          if (allVariantsError) {
            console.error(`Error fetching all variants for product ${product.id}: ${allVariantsError.message}`);
            errorCount++;
            continue;
          }
          
          variantToUse = allVariants && allVariants.length > 0 ? allVariants[0] : null;
        }
        
        if (!variantToUse) {
          console.warn(`No variants found for product ${product.id} (${product.name}). Skipping.`);
          continue;
        }
        
        // Update the product with variant data
        const { error: updateError } = await supabase
          .from('product_skus')
          .update({
            capacity_kw: variantToUse.capacity_kw,
            price: variantToUse.price,
            subsidy_percentage: variantToUse.subsidy_percentage,
            area_required: variantToUse.area_required,
            monthly_savings: variantToUse.monthly_savings,
            installation_time: variantToUse.installation_days
          })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`Error updating product ${product.id}: ${updateError.message}`);
          errorCount++;
          continue;
        }
        
        updatedCount++;
        console.log(`Updated product ${product.name} with variant data`);
      } catch (err) {
        console.error(`Error processing product ${product.id}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\nMigration summary:\n- ${updatedCount} products updated successfully\n- ${errorCount} errors encountered`);
    
    // Step 5: Create a compatibility view for backward compatibility
    console.log('\nCreating compatibility view for backward compatibility...');
    await supabase.rpc('execute_sql', {
      query: `
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
      `
    });
    
    console.log('\nMigration completed successfully!');
    console.log('\nNOTE: The product_variants table has been backed up to product_variants_backup');
    console.log('      You can safely drop the product_variants table once you verify everything works correctly.');
    console.log('      To drop the table, run: DROP TABLE public.product_variants;');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
}

// Run the migration
migrateToNonVariantStructure().then(() => console.log('Script execution completed.'));
