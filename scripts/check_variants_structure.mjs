import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkVariantsStructure() {
  try {
    console.log('Checking if product_variants table exists...');
    
    // Check if product_variants table exists
    const { data: tables, error: tableError } = await supabase
      .rpc('get_tables');
    
    if (tableError) {
      console.error('Error fetching tables:', tableError.message);
      
      // Try an alternative approach to check if the table exists
      console.log('Trying alternative approach to check table existence...');
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .limit(1);
      
      if (variantsError) {
        console.error('Error checking product_variants:', variantsError.message);
        if (variantsError.message.includes('relation "product_variants" does not exist')) {
          console.log('The product_variants table does not exist.');
        }
        return;
      } else {
        console.log('The product_variants table exists.');
      }
    } else {
      const hasVariantsTable = tables.some(t => t.table_name === 'product_variants');
      console.log(hasVariantsTable ? 'The product_variants table exists.' : 'The product_variants table does not exist.');
    }
    
    // Try to get the structure of the product_variants table
    console.log('\nAttempting to fetch variant data to understand structure...');
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(5);
    
    if (variantsError) {
      console.error('Error fetching variants:', variantsError.message);
      return;
    }
    
    if (variants && variants.length > 0) {
      console.log(`Found ${variants.length} variants. First variant structure:`);
      console.log(JSON.stringify(variants[0], null, 2));
      
      // Count total variants
      const { count, error: countError } = await supabase
        .from('product_variants')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`Total variants in database: ${count}`);
      }
    } else {
      console.log('No variants found in the database.');
    }
    
    // Check if any product has variants associated with it
    console.log('\nChecking for products with variants...');
    
    // First, get some product IDs
    const { data: products, error: productsError } = await supabase
      .from('product_skus')
      .select('id, name')
      .limit(5);
    
    if (productsError) {
      console.error('Error fetching products:', productsError.message);
      return;
    }
    
    if (products && products.length > 0) {
      console.log('Checking variants for these products:');
      for (const product of products) {
        const { data: productVariants, error: pvError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id);
        
        if (!pvError) {
          console.log(`- ${product.name} (${product.id}): ${productVariants.length} variants`);
          if (productVariants.length > 0) {
            console.log('  Sample variant:', JSON.stringify(productVariants[0], null, 2));
          }
        } else {
          console.log(`- Error checking variants for ${product.name}: ${pvError.message}`);
          if (pvError.message.includes('column "product_id" does not exist')) {
            // Try alternative column names
            const alternativeColumns = ['product_sku_id', 'sku_id', 'product'];
            console.log('  Trying alternative column names:', alternativeColumns.join(', '));
            
            for (const column of alternativeColumns) {
              const { data, error } = await supabase
                .from('product_variants')
                .select('*')
                .eq(column, product.id);
              
              if (!error && data.length > 0) {
                console.log(`  Found variants using column "${column}": ${data.length} variants`);
                console.log('  Sample variant:', JSON.stringify(data[0], null, 2));
                break;
              }
            }
          }
        }
      }
    } else {
      console.log('No products found to check for variants.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
checkVariantsStructure().then(() => console.log('Done!'));
