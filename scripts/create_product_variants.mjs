import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Constants for calculations
const PRICE_PER_KW = 70000;

// Create variants for a product
async function createVariantsForProduct(product) {
  console.log(`Creating variants for product: ${product.name}`);
  
  // Extract capacity from product name if possible
  let defaultCapacity = 1; // default value
  
  // Try to parse capacity from the product name
  const capacityMatch = product.name.match(/(\d+(?:\.\d+)?)\s*kW/i);
  if (capacityMatch) {
    defaultCapacity = parseFloat(capacityMatch[1]);
    console.log(`  Detected capacity from name: ${defaultCapacity} kW`);
  } else if (product.capacity_kw && !isNaN(product.capacity_kw)) {
    defaultCapacity = parseFloat(product.capacity_kw);
    console.log(`  Using existing capacity_kw field: ${defaultCapacity} kW`);
  }
  
  // Define what capacities we should create based on product type
  let capacities = [];
  
  // For solar systems, create standard capacities
  if (product.name.includes('Solar System') || product.category === 'Solar Panels') {
    // Create variants based on the current product capacity
    if (defaultCapacity <= 2) {
      capacities = [1, 2, 3, 5];
    } else if (defaultCapacity <= 5) {
      capacities = [3, 5, 10];
    } else {
      capacities = [5, 10, 20];
    }
  } 
  // For water heaters, use capacities in LPD
  else if (product.name.includes('Water Heater')) {
    capacities = [100, 200, 300, 500];
    // Extract LPD from name
    const lpdMatch = product.name.match(/(\d+)\s*LPD/i);
    if (lpdMatch) {
      defaultCapacity = parseInt(lpdMatch[1], 10) / 100; // Convert LPD to kW equivalent
    }
  }
  // For water pumps, use HP
  else if (product.name.includes('Water Pump')) {
    capacities = [1, 2, 3, 5];
    // Extract HP from name
    const hpMatch = product.name.match(/(\d+(?:\.\d+)?)\s*HP/i);
    if (hpMatch) {
      defaultCapacity = parseFloat(hpMatch[1]);
    }
  }
  // For solar lights
  else if (product.name.includes('Light')) {
    capacities = [0.01, 0.02, 0.05];
    defaultCapacity = 0.02;
  } 
  // For electric fences
  else if (product.name.includes('Fence')) {
    capacities = [0.05, 0.1, 0.2];
    defaultCapacity = 0.1;
  }
  // Default for other products
  else {
    capacities = [0.5, 1, 2, 3];
  }
  
  console.log(`  Will create variants with capacities: ${capacities.join(', ')} kW`);
  console.log(`  Default capacity will be: ${defaultCapacity} kW`);
  
  // Create each variant
  for (const capacity of capacities) {
    // Calculate values based on capacity
    const price = Math.round(PRICE_PER_KW * capacity);
    const areaRequired = Math.round(100 * capacity);
    const monthlySavings = Math.round(1250 * capacity);
    const isDefault = Math.abs(capacity - defaultCapacity) < 0.1; // Compare with some tolerance
    
    // Get days for installation based on capacity
    let installationDays = '4-5';
    if (capacity > 10) installationDays = '7-10';
    else if (capacity > 5) installationDays = '5-7';
    
    console.log(`  Creating variant: ${capacity} kW, price: ₹${price}, default: ${isDefault}`);
    
    try {
      // Check if variant already exists
      const { data: existing } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', product.id)
        .eq('capacity_kw', capacity)
        .single();
      
      if (existing) {
        console.log(`    Variant ${capacity} kW already exists, updating...`);
        
        // Update existing variant
        const { data, error } = await supabase
          .from('product_variants')
          .update({
            price,
            area_required: areaRequired,
            monthly_savings: monthlySavings,
            installation_days: installationDays,
            is_default: isDefault,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();
        
        if (error) {
          console.error(`    Error updating variant: ${error.message}`);
        } else {
          console.log(`    Updated variant with ID: ${data[0].id}`);
        }
      } else {
        // Create new variant
        const { data, error } = await supabase
          .from('product_variants')
          .insert({
            product_id: product.id,
            capacity_kw: capacity,
            price,
            subsidy_percentage: 35,
            area_required: areaRequired,
            monthly_savings: monthlySavings,
            installation_days: installationDays,
            is_default: isDefault
          })
          .select();
        
        if (error) {
          console.error(`    Error creating variant: ${error.message}`);
        } else {
          console.log(`    Created variant with ID: ${data[0].id}`);
        }
      }
    } catch (err) {
      console.error(`    Unexpected error for variant ${capacity} kW:`, err);
    }
  }
  
  console.log(`  Finished creating variants for ${product.name}`);
}

// Main function to process all products
async function createAllProductVariants() {
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
    
    console.log(`Found ${products.length} products. Creating variants for each...`);
    
    // Process each product
    for (const product of products) {
      await createVariantsForProduct(product);
    }
    
    // Verify results
    console.log('\nVerifying results...');
    const { data: variants, error: varError } = await supabase
      .from('product_variants')
      .select('*');
    
    if (varError) {
      console.error('Error fetching variants:', varError.message);
    } else {
      console.log(`Successfully created ${variants.length} variants across ${products.length} products.`);
      
      // Count default variants
      const defaultVariants = variants.filter(v => v.is_default);
      console.log(`Created ${defaultVariants.length} default variants.`);
      
      if (defaultVariants.length !== products.length) {
        console.warn('Warning: Not all products have a default variant!');
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
createAllProductVariants().then(() => console.log('Done!'));
