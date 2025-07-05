import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function analyzeProductStructure() {
  try {
    console.log('Analyzing current product structure...');
    
    // Get all products
    const { data: products, error } = await supabase
      .from('product_skus')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error.message);
      return;
    }
    
    console.log(`Found ${products.length} total product entries.`);
    
    // Get all variants
    const { data: variants, error: varError } = await supabase
      .from('product_variants')
      .select('*');
    
    if (varError) {
      console.error('Error fetching variants:', varError.message);
    } else {
      console.log(`Found ${variants.length} total variant entries.`);
    }
    
    // Group products by type
    const productGroups = {
      'On-Grid Solar': [],
      'Off-Grid Solar': [],
      'Hybrid Solar': [],
      'Street Light': [],
      'Water Heater': [],
      'Light': [],
      'Fence': [],
      'Other': []
    };
    
    // Analyze each product and categorize
    products.forEach(product => {
      if (product.name.includes('On-Grid')) {
        productGroups['On-Grid Solar'].push(product);
      } else if (product.name.includes('Off-Grid')) {
        productGroups['Off-Grid Solar'].push(product);
      } else if (product.name.includes('Hybrid')) {
        productGroups['Hybrid Solar'].push(product);
      } else if (product.name.includes('Street Light')) {
        productGroups['Street Light'].push(product);
      } else if (product.name.includes('Water Heater')) {
        productGroups['Water Heater'].push(product);
      } else if (product.name.includes('Light') || 
                product.name.includes('light') ||
                product.name.includes('Cube')) {
        productGroups['Light'].push(product);
      } else if (product.name.includes('Fence')) {
        productGroups['Fence'].push(product);
      } else {
        productGroups['Other'].push(product);
      }
    });
    
    // Print analysis by group
    console.log('\n----- PRODUCT STRUCTURE ANALYSIS -----');
    
    Object.keys(productGroups).forEach(groupName => {
      const group = productGroups[groupName];
      if (group.length > 0) {
        console.log(`\n${groupName} (${group.length} products):`);
        
        group.forEach(product => {
          const productVariants = variants ? 
            variants.filter(v => v.product_id === product.id) : [];
            
          console.log(`  - ${product.name} (ID: ${product.id})`);
          console.log(`    Category: ${product.category || 'None'}`);
          console.log(`    SKU: ${product.sku || 'None'}`);
          console.log(`    Price: ₹${product.price || 0}`);
          console.log(`    Capacity: ${product.capacity_kw || 'N/A'} kW`);
          console.log(`    Variant count: ${productVariants.length}`);
          
          // Log variants if they exist
          if (productVariants.length > 0) {
            console.log('    Variants:');
            productVariants.forEach(variant => {
              console.log(`      - ${variant.capacity_kw} kW (₹${variant.price}, Default: ${variant.is_default})`);
            });
          }
          console.log('');
        });
      }
    });
    
    // Analyze columns
    console.log('\n----- COLUMNS ANALYSIS -----');
    if (products && products.length > 0) {
      const columns = Object.keys(products[0]);
      console.log('Product SKU columns:', columns.join(', '));
    }
    
    if (variants && variants.length > 0) {
      const variantColumns = Object.keys(variants[0]);
      console.log('Variant columns:', variantColumns.join(', '));
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
analyzeProductStructure().then(() => console.log('\nAnalysis complete.'));
