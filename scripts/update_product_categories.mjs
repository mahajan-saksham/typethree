import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map old category strings to new category IDs based on our current categories
const categoryMapping = {
  // Solar Systems
  'on-grid': '646e9172-8d9e-4e65-9b23-602a07a839da',     // Solar Panels
  'off-grid': '646e9172-8d9e-4e65-9b23-602a07a839da',    // Solar Panels
  'hybrid': '646e9172-8d9e-4e65-9b23-602a07a839da',      // Solar Panels
  
  // Water related
  'water_heating': '83cda724-dc17-45e3-8f70-5ee6bdbf20a5', // Water Heater
  'water_pumping': '45106acd-566a-4f4f-81ac-9b10668688ea', // Water Pump
  
  // Lighting
  'rock_lighting': '8cd9b310-788f-41f6-96b8-1ca720f02b95', // Lights
  'lighting': '8cd9b310-788f-41f6-96b8-1ca720f02b95',      // Lights
  'street_light': '836807e0-e87f-4ac9-b3b7-dc748cc4a09a',  // Street Lights
  
  // Other
  'fencing': '390efa19-c93f-4c36-b11c-a4ddbc5bd93c',       // Solar Fence
  
  // Default for any uncategorized products
  'default': 'a0460345-ecea-44d5-beff-41ff93d8cdcf'        // Accessories
};

// Function to determine the best category based on product name and current category
function determineBestCategory(product) {
  const name = product.name.toLowerCase();
  const sku = (product.sku || '').toLowerCase();
  const currentCategory = product.category || '';
  const description = (product.description || '').toLowerCase();
  
  // Direct SKU mapping first - most accurate
  if (sku === 'apn-ongrid' || sku === 'apn-offgrid' || sku === 'apn-hybrid') {
    return '646e9172-8d9e-4e65-9b23-602a07a839da'; // Solar Panels
  }
  
  if (sku === 'apn-ssl') {
    return '836807e0-e87f-4ac9-b3b7-dc748cc4a09a'; // Street Lights
  }
  
  if (sku === 'apn-swh') {
    return '83cda724-dc17-45e3-8f70-5ee6bdbf20a5'; // Water Heater
  }
  
  if (sku === 'apn-srl') {
    return '8cd9b310-788f-41f6-96b8-1ca720f02b95'; // Lights
  }
  
  if (sku === 'apn-fence') {
    return '390efa19-c93f-4c36-b11c-a4ddbc5bd93c'; // Solar Fence
  }
  
  if (sku === 'apn-swp') {
    return '45106acd-566a-4f4f-81ac-9b10668688ea'; // Water Pump
  }
  
  // If SKU didn't match, try name matching
  // Solar Panels - Check for specific solar systems
  if (
    name.includes('on-grid') || 
    name.includes('off-grid') || 
    name.includes('hybrid') || 
    name.includes('solar system') || 
    name.includes('solar panel') || 
    currentCategory === 'on-grid' || 
    currentCategory === 'off-grid' || 
    currentCategory === 'hybrid'
  ) {
    return '646e9172-8d9e-4e65-9b23-602a07a839da'; // Solar Panels
  }
  
  // Water Heater
  if (
    name.includes('water heat') || 
    name.includes('water heater') || 
    currentCategory === 'water_heating'
  ) {
    return '83cda724-dc17-45e3-8f70-5ee6bdbf20a5'; // Water Heater
  }
  
  // Water Pumping
  if (
    name.includes('water pump') || 
    name.includes('pump') || 
    currentCategory === 'water_pumping'
  ) {
    return '45106acd-566a-4f4f-81ac-9b10668688ea'; // Water Pump
  }
  
  // Street Lights
  if (
    name.includes('street light') || 
    currentCategory === 'street_light'
  ) {
    return '836807e0-e87f-4ac9-b3b7-dc748cc4a09a'; // Street Lights
  }
  
  // Regular Lights
  if (
    (name.includes('light') && !name.includes('street')) || 
    currentCategory === 'lighting' || 
    currentCategory === 'rock_lighting'
  ) {
    return '8cd9b310-788f-41f6-96b8-1ca720f02b95'; // Lights
  }
  
  // Fencing
  if (
    name.includes('fence') || 
    name.includes('fencing') || 
    currentCategory === 'fencing'
  ) {
    return '390efa19-c93f-4c36-b11c-a4ddbc5bd93c'; // Solar Fence
  }
  
  // Default to Accessories for anything else
  return 'a0460345-ecea-44d5-beff-41ff93d8cdcf'; // Accessories
}

async function updateProductCategories() {
  console.log('Updating product categories...');
  
  // Fetch products to update
  const { data: products, error: productsError } = await supabase
    .from('product_skus')
    .select('id, name, sku, category, category_id');
  
  if (productsError) {
    console.error('Error fetching products:', productsError.message);
    return;
  }
  
  console.log(`Found ${products.length} products to update.`);
  
  // Get all categories for reference
  const { data: categories, error: catError } = await supabase
    .from('product_categories')
    .select('*');
  
  if (catError) {
    console.error('Error fetching categories:', catError.message);
    return;
  }
  
  // Create a map of category IDs to names for easy lookup
  const categoryNames = {};
  categories.forEach(cat => {
    categoryNames[cat.id] = cat.name;
  });
  
  // Update product categories
  for (const product of products) {
    const newCategoryId = determineBestCategory(product);
    const newCategoryName = categoryNames[newCategoryId];
    
    console.log(`Updating product "${product.name}": ${product.category || 'None'} -> ${newCategoryName} (ID: ${newCategoryId})`);
    
    const { error: updateError } = await supabase
      .from('product_skus')
      .update({ category_id: newCategoryId })
      .eq('id', product.id);

    if (updateError) {
      console.error(`Error updating product ${product.id}:`, updateError.message);
      continue;
    }
  }
  console.log('Product category updates completed!');
}

// Run the script
updateProductCategories().catch(err => {
  console.error('Unexpected error:', err);
});
