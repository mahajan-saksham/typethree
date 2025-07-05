import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Verifies that all products have the correct data from their variants
 */
async function verifyMigration() {
  try {
    console.log('Verifying migration to non-variant structure...');
    
    // Fetch all products
    console.log('Fetching all products...');
    const { data: products, error: productsError } = await supabase
      .from('product_skus')
      .select('*');
    
    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }
    
    console.log(`Found ${products.length} products. Verifying data...`);
    
    // Verify each product
    for (const product of products) {
      console.log(`\nVerifying product: ${product.name} (${product.id})`);
      console.log(`  Capacity: ${product.capacity_kw} kW`);
      console.log(`  Price: ₹${product.price.toLocaleString()}`);
      console.log(`  Subsidy Percentage: ${product.subsidy_percentage}%`);
      console.log(`  Area Required: ${product.area_required} sq.ft`);
      console.log(`  Monthly Savings: ₹${product.monthly_savings.toLocaleString()}`);
      console.log(`  Installation Time: ${product.installation_time}`);
      
      // If the product still has a default_variant_id, fetch the variant for comparison
      if (product.default_variant_id) {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('id', product.default_variant_id)
          .single();
        
        if (variantError) {
          console.error(`  Error fetching default variant: ${variantError.message}`);
          continue;
        }
        
        if (variant) {
          console.log('\n  Comparing with default variant:');
          console.log(`  Variant Capacity: ${variant.capacity_kw} kW ${variant.capacity_kw === product.capacity_kw ? '✓' : '❌'}`);
          console.log(`  Variant Price: ₹${variant.price.toLocaleString()} ${variant.price === product.price ? '✓' : '❌'}`);
          console.log(`  Variant Subsidy: ${variant.subsidy_percentage}% ${variant.subsidy_percentage === product.subsidy_percentage ? '✓' : '❌'}`);
          console.log(`  Variant Area: ${variant.area_required} sq.ft ${variant.area_required === product.area_required ? '✓' : '❌'}`);
          console.log(`  Variant Savings: ₹${variant.monthly_savings.toLocaleString()} ${variant.monthly_savings === product.monthly_savings ? '✓' : '❌'}`);
          console.log(`  Variant Install Time: ${variant.installation_days} ${variant.installation_days === product.installation_time ? '✓' : '❌'}`);
        }
      }
    }
    
    console.log('\nVerification complete!');
    console.log('\nIf all data looks correct, you can proceed with the next steps:');
    console.log('1. Run SQL commands to remove the variant relationship:');
    console.log('   - ALTER TABLE product_skus DROP CONSTRAINT IF EXISTS fk_product_skus_default_variant;');
    console.log('   - ALTER TABLE product_skus DROP COLUMN IF EXISTS default_variant_id;');
    console.log('2. Once everything is working correctly, you can drop the product_variants table:');
    console.log('   - DROP TABLE public.product_variants CASCADE;');
    
  } catch (error) {
    console.error('Verification failed:', error.message);
  }
}

// Run the verification
verifyMigration().then(() => console.log('Script execution completed.'));
