// Script to set default variants for all products without one

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from the project's supabaseClient.ts file
const supabaseUrl = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzY1ODQsImV4cCI6MjA1OTI1MjU4NH0.seU-MjLZ3ze6b22InyZA-SCPg64fVPTC8Lnnnj0-Aps';

console.log('Using Supabase project URL:', supabaseUrl);


const supabase = createClient(supabaseUrl, supabaseKey);

async function setDefaultVariants() {
  console.log('Starting default variant update process...');
  
  // Step 1: Get all products that don't have a default_variant_id set
  const { data: productsWithoutDefault, error: fetchError } = await supabase
    .from('product_skus')
    .select('id, name')
    .is('default_variant_id', null);
  
  if (fetchError) {
    console.error('Error fetching products:', fetchError);
    return;
  }
  
  console.log(`Found ${productsWithoutDefault.length} products without default variants`);
  
  // Step 2: Process each product
  for (const product of productsWithoutDefault) {
    console.log(`Processing product: ${product.name} (${product.id})`);
    
    // Step 3: Get all variants for this product that have an image_url
    const { data: variants, error: variantError } = await supabase
      .from('product_variants')
      .select('id, variant_name, image_url')
      .eq('product_id', product.id)
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false }); // Prefer newer variants
    
    if (variantError) {
      console.error(`Error fetching variants for product ${product.id}:`, variantError);
      continue;
    }
    
    if (!variants || variants.length === 0) {
      console.log(`No variants with images found for product ${product.name}. Skipping.`);
      continue;
    }
    
    // Step 4: Pick the first variant with an image as the default
    const defaultVariant = variants[0];
    console.log(`Setting variant ${defaultVariant.variant_name || defaultVariant.id} as default`);
    
    // Step 5: Update the variant to mark it as default
    const { error: updateVariantError } = await supabase
      .from('product_variants')
      .update({ is_default: true })
      .eq('id', defaultVariant.id);
    
    if (updateVariantError) {
      console.error(`Error updating variant ${defaultVariant.id}:`, updateVariantError);
      continue;
    }
    
    // Step 6: Update the product to set this as the default variant
    const { error: updateProductError } = await supabase
      .from('product_skus')
      .update({ default_variant_id: defaultVariant.id })
      .eq('id', product.id);
    
    if (updateProductError) {
      console.error(`Error updating product ${product.id}:`, updateProductError);
      continue;
    }
    
    console.log(`✅ Successfully set default variant for ${product.name}`);
  }
  
  console.log('Default variant update process complete!');
}

// Run the script
setDefaultVariants()
  .then(() => {
    console.log('Script execution completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
  });
