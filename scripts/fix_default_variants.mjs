import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixDefaultVariants() {
  try {
    console.log('Fetching all products...');
    
    // Get all products
    const { data: products, error } = await supabase
      .from('product_skus')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error.message);
      return;
    }
    
    console.log(`Found ${products.length} products. Fixing default variants for each...`);
    
    // Process each product
    for (const product of products) {
      console.log(`Processing product: ${product.name} (ID: ${product.id})`);
      
      // Get all variants for this product
      const { data: variants, error: varError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .order('capacity_kw', { ascending: true });
      
      if (varError) {
        console.error(`  Error fetching variants for ${product.name}: ${varError.message}`);
        continue;
      }
      
      if (!variants || variants.length === 0) {
        console.warn(`  No variants found for product ${product.name}`);
        continue;
      }
      
      console.log(`  Found ${variants.length} variants`);
      
      // Check if a default variant exists
      const defaultVariant = variants.find(v => v.is_default);
      
      if (defaultVariant) {
        console.log(`  Default variant already exists (ID: ${defaultVariant.id}, Capacity: ${defaultVariant.capacity_kw} kW)`);
        continue;
      }
      
      // No default exists, set one
      console.log('  No default variant found, setting one...');
      
      // Determine which variant to set as default based on product name
      let bestVariant = variants[0]; // Default to first variant
      
      // Try to extract capacity from the product name
      const capacityMatch = product.name.match(/(\d+(?:\.\d+)?)\s*kW/i);
      if (capacityMatch) {
        const nameCapacity = parseFloat(capacityMatch[1]);
        // Find best match
        bestVariant = variants.reduce((best, current) => {
          return Math.abs(current.capacity_kw - nameCapacity) < Math.abs(best.capacity_kw - nameCapacity) 
            ? current : best;
        }, variants[0]);
        
        console.log(`  Found capacity ${nameCapacity} kW in name, best match is ${bestVariant.capacity_kw} kW`);
      } else if (product.capacity_kw) {
        // Use capacity_kw field if it exists
        const productCapacity = parseFloat(product.capacity_kw);
        bestVariant = variants.reduce((best, current) => {
          return Math.abs(current.capacity_kw - productCapacity) < Math.abs(best.capacity_kw - productCapacity) 
            ? current : best;
        }, variants[0]);
        
        console.log(`  Using capacity_kw field: ${productCapacity} kW, best match is ${bestVariant.capacity_kw} kW`);
      } else {
        // For water heaters (look for LPD)
        if (product.name.includes('Water Heater')) {
          const lpdMatch = product.name.match(/(\d+)\s*LPD/i);
          if (lpdMatch) {
            const lpdValue = parseInt(lpdMatch[1], 10);
            const targetCapacity = lpdValue / 100;
            bestVariant = variants.reduce((best, current) => {
              return Math.abs(current.capacity_kw - targetCapacity) < Math.abs(best.capacity_kw - targetCapacity) 
                ? current : best;
            }, variants[0]);
            console.log(`  Found ${lpdValue} LPD in name, best match is ${bestVariant.capacity_kw} kW`);
          }
        }
        // For water pumps (look for HP)
        else if (product.name.includes('Water Pump')) {
          const hpMatch = product.name.match(/(\d+(?:\.\d+)?)\s*HP/i);
          if (hpMatch) {
            const hpValue = parseFloat(hpMatch[1]);
            bestVariant = variants.reduce((best, current) => {
              return Math.abs(current.capacity_kw - hpValue) < Math.abs(best.capacity_kw - hpValue) 
                ? current : best;
            }, variants[0]);
            console.log(`  Found ${hpValue} HP in name, best match is ${bestVariant.capacity_kw} kW`);
          }
        }
      }
      
      // Update the variant to be the default
      console.log(`  Setting variant with ID ${bestVariant.id} (${bestVariant.capacity_kw} kW) as default`);
      
      const { data: updated, error: updateError } = await supabase
        .from('product_variants')
        .update({ is_default: true })
        .eq('id', bestVariant.id)
        .select();
      
      if (updateError) {
        console.error(`  Error setting default variant: ${updateError.message}`);
      } else {
        console.log(`  Successfully set default variant`);
      }
    }
    
    // Verify results
    console.log('\nVerifying results...');
    
    // Get all products with their default variants
    const { data: productsWithDefaults, error: finalError } = await supabase
      .from('product_skus')
      .select(`
        id,
        name,
        product_variants!inner(id, capacity_kw, is_default)
      `)
      .eq('product_variants.is_default', true);
    
    if (finalError) {
      console.error('Error verifying results:', finalError.message);
    } else {
      console.log(`${productsWithDefaults.length} out of ${products.length} products now have default variants.`);
      
      if (productsWithDefaults.length < products.length) {
        console.warn('Warning: Some products still do not have a default variant:');
        
        // Find products without default variants
        const productsWithDefaultIds = productsWithDefaults.map(p => p.id);
        const productsWithoutDefaults = products.filter(p => !productsWithDefaultIds.includes(p.id));
        
        productsWithoutDefaults.forEach(p => {
          console.warn(`  - ${p.name} (ID: ${p.id})`);
        });
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
fixDefaultVariants().then(() => console.log('Done!'));
