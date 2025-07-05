import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Base product definitions
const baseProducts = [
  {
    name: "On-Grid Solar System",
    sku: "APN-ONGRID",
    category: "Solar Panels",
    category_id: "646e9172-8d9e-4e65-9b23-602a07a839da", // Solar Panels category ID
    description: "On-grid solar systems are connected to the public electricity grid and do not require battery storage. These systems allow you to sell excess energy back to the grid through net metering.",
    capacities: [1, 2, 3, 5, 10, 20],
    variantFormat: "{capacity} kW On-Grid Solar System",
    skuFormat: "APN-ONGRID-{capacity}KW",
    panel_type: "Monocrystalline",
    generation: "3rd Gen",
    imageUrlTemplate: "/images/products/ongrid-{capacity}kw.jpg"
  },
  {
    name: "Off-Grid Solar System",
    sku: "APN-OFFGRID",
    category: "Solar Panels",
    category_id: "646e9172-8d9e-4e65-9b23-602a07a839da", // Solar Panels category ID
    description: "Off-grid solar systems operate independently from the public electricity grid. They include battery storage to provide power when the sun isn't shining, making them ideal for remote locations.",
    capacities: [1, 2, 3, 5, 10],
    variantFormat: "{capacity} kW Off-Grid Solar System",
    skuFormat: "APN-OFFGRID-{capacity}KW",
    panel_type: "Monocrystalline",
    generation: "3rd Gen",
    imageUrlTemplate: "/images/products/offgrid-{capacity}kw.jpg"
  },
  {
    name: "Hybrid Solar System",
    sku: "APN-HYBRID",
    category: "Solar Panels",
    category_id: "646e9172-8d9e-4e65-9b23-602a07a839da", // Solar Panels category ID
    description: "Hybrid solar systems combine the best of both on-grid and off-grid systems. They connect to the grid and also include battery storage, providing flexibility and backup power during outages.",
    capacities: [1, 2, 3, 5],
    variantFormat: "{capacity} kW Hybrid Solar System",
    skuFormat: "APN-HYBRID-{capacity}KW",
    panel_type: "Monocrystalline",
    generation: "3rd Gen",
    imageUrlTemplate: "/images/products/hybrid-{capacity}kw.jpg"
  },
  {
    name: "Solar Street Light",
    sku: "APN-SSL",
    category: "Accessories",
    category_id: "a0460345-ecea-44d5-beff-41ff93d8cdcf", // Accessories category ID
    description: "Solar street lights are standalone lighting fixtures powered by solar energy. They include solar panels, LED lights, batteries, and smart controllers, operating automatically from dusk to dawn.",
    capacities: [20, 50, 100], // Wattage
    capacityUnit: "W",
    variantFormat: "{capacity}W Solar Street Light",
    skuFormat: "APN-SSL-{capacity}W",
    imageUrlTemplate: "/images/products/streetlight-{capacity}w.jpg"
  },
  {
    name: "Solar Water Heater",
    sku: "APN-SWH",
    category: "Accessories",
    category_id: "a0460345-ecea-44d5-beff-41ff93d8cdcf", // Accessories category ID
    description: "Solar water heaters use the sun's energy to heat water for residential or commercial use. They reduce electricity bills and are eco-friendly with minimal maintenance required.",
    capacities: [100, 200, 300, 500], // LPD (Liters Per Day)
    capacityUnit: "LPD",
    variantFormat: "{capacity} LPD Solar Water Heater",
    skuFormat: "APN-SWH-{capacity}LPD",
    imageUrlTemplate: "/images/products/waterheater-{capacity}lpd.jpg"
  },
  {
    name: "Solar Light",
    sku: "APN-SRL",
    category: "Accessories",
    category_id: "a0460345-ecea-44d5-beff-41ff93d8cdcf", // Accessories category ID
    description: "Solar lights are decorative and practical lighting solutions powered by solar energy. They charge during the day and illuminate automatically at night.",
    variantTypes: [
      { 
        name: "Solar Rock Light",
        sku: "APN-SRL-ROCK",
        capacity: 0.005,
        price: 450,
        image: "/images/products/solar-rock-light.jpg"
      },
      { 
        name: "Solar Ice Cube Light",
        sku: "APN-SRL-CUBE",
        capacity: 0.005, 
        price: 550,
        image: "/images/products/solar-ice-cube-light.jpg"
      }
    ]
  },
  {
    name: "Solar Electric Fence",
    sku: "APN-FENCE",
    category: "Accessories",
    category_id: "a0460345-ecea-44d5-beff-41ff93d8cdcf", // Accessories category ID
    description: "Solar electric fences provide secure perimeter protection powered by solar energy. They deliver pulsed electric shocks to deter intruders and are ideal for farms, estates, and commercial properties.",
    capacities: [100, 500, 1000], // meters
    capacityUnit: "m",
    variantFormat: "{capacity}m Solar Electric Fence",
    skuFormat: "APN-FENCE-{capacity}M",
    imageUrlTemplate: "/images/products/fence-{capacity}m.jpg"
  },
  {
    name: "Solar Water Pump",
    sku: "APN-SWP",
    category: "Accessories",
    category_id: "a0460345-ecea-44d5-beff-41ff93d8cdcf", // Accessories category ID
    description: "Solar water pumps operate using energy from solar panels instead of grid electricity or fossil fuels. They're ideal for agricultural irrigation, livestock water supply, and residential water needs.",
    capacities: [0.5, 1, 2, 3, 5], // HP (Horsepower)
    capacityUnit: "HP",
    variantFormat: "{capacity} HP Solar Water Pump",
    skuFormat: "APN-SWP-{capacity}HP",
    imageUrlTemplate: "/images/products/waterpump-{capacity}hp.jpg"
  }
];

// Helper function to generate price based on capacity and product type
function generatePrice(productType, capacity, capacityUnit = "kW") {
  let basePrice = 0;
  
  if (capacityUnit === "kW") {
    switch (productType) {
      case "On-Grid Solar System":
        basePrice = 45000 * capacity;
        break;
      case "Off-Grid Solar System":
        basePrice = 100000 * capacity;
        break;
      case "Hybrid Solar System":
        basePrice = 120000 * capacity;
        break;
      default:
        basePrice = 70000 * capacity; // Default price calculation
    }
  } else if (capacityUnit === "W") {
    // Street lights
    basePrice = 300 * capacity;
  } else if (capacityUnit === "LPD") {
    // Water heaters
    basePrice = 150 * capacity + 15000;
  } else if (capacityUnit === "m") {
    // Electric fence
    basePrice = 150 * capacity + 10000;
  } else if (capacityUnit === "HP") {
    // Water pumps
    basePrice = 85000 * capacity;
  }
  
  return Math.round(basePrice);
}

// Helper function to calculate area required based on capacity
function calculateArea(productType, capacity, capacityUnit = "kW") {
  if (capacityUnit === "kW") {
    // Solar systems require approx 100 sqm per kW
    return capacity * 100;
  }
  return 0; // Other product types don't have meaningful area requirements
}

// Helper function to calculate monthly savings
function calculateMonthlySavings(productType, capacity, capacityUnit = "kW") {
  if (capacityUnit === "kW") {
    // Solar systems generate approx savings of 1250 per kW per month
    return capacity * 1250;
  } else if (capacityUnit === "LPD") {
    // Water heaters save approx 8 rupees per LPD per month
    return capacity * 8;
  }
  return 0; // Default for other product types
}

// Helper function to calculate payback period in years
function calculatePaybackPeriod(price, monthlySavings, subsidyPercentage = 35) {
  if (monthlySavings <= 0) return 0;
  const priceAfterSubsidy = price * (1 - subsidyPercentage / 100);
  const yearlySavings = monthlySavings * 12;
  return Math.round((priceAfterSubsidy / yearlySavings) * 10) / 10; // Round to 1 decimal
}

// Function to get existing product data from current products
async function getExistingProductData() {
  const { data: products, error } = await supabase
    .from('product_skus')
    .select('*');
  
  if (error) {
    console.error('Error fetching existing products:', error.message);
    return {};
  }
  
  // Create a map of product names to their data for easy lookup
  const productMap = {};
  products.forEach(product => {
    productMap[product.name] = product;
  });
  
  return productMap;
}

// Main function to create base products and variants
async function restructureProducts() {
  try {
    console.log('Starting product restructuring...');
    
    // Get existing product data
    const existingProductData = await getExistingProductData();
    
    // Track created products
    const createdProductIds = {};
    
    // Process each base product
    for (const baseProduct of baseProducts) {
      console.log(`\nProcessing base product: ${baseProduct.name}`);
      
      // Create or update base product
      const { data: product, error } = await supabase
        .from('product_skus')
        .upsert({
          name: baseProduct.name,
          sku: baseProduct.sku,
          description: baseProduct.description,
          category: baseProduct.category,
          category_id: baseProduct.category_id,
          price: 0, // Base product doesn't have a specific price - variants do
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating base product ${baseProduct.name}:`, error.message);
        continue;
      }
      
      console.log(`Created/updated base product: ${product.name} (ID: ${product.id})`);
      createdProductIds[baseProduct.name] = product.id;
      
      // Special handling for product types with named variants
      if (baseProduct.variantTypes) {
        console.log(`Creating named variant types for ${baseProduct.name}...`);
        
        for (const variantType of baseProduct.variantTypes) {
          // Look for existing product with this name
          const existingProduct = existingProductData[variantType.name];
          
          // Create variant
          const { data: variant, error: variantError } = await supabase
            .from('product_variants')
            .upsert({
              product_id: product.id,
              variant_name: variantType.name,
              variant_sku: variantType.sku,
              capacity_kw: variantType.capacity,
              price: variantType.price,
              subsidy_percentage: 0, // No subsidy for small items
              area_required: 0,
              monthly_savings: 0,
              installation_days: '1',
              is_default: variantType === baseProduct.variantTypes[0], // First one is default
              image_url: variantType.image || existingProduct?.image_url,
              description: existingProduct?.description || '',
              specifications: existingProduct?.specifications,
              features: existingProduct?.features || JSON.stringify(['Energy Efficient', 'Weather Resistant', 'Easy Installation']),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (variantError) {
            console.error(`Error creating variant ${variantType.name}:`, variantError.message);
          } else {
            console.log(`Created variant: ${variant.variant_name} (ID: ${variant.id})`);
          }
        }
      } 
      // Standard variants with capacities
      else if (baseProduct.capacities) {
        console.log(`Creating capacity-based variants for ${baseProduct.name}...`);
        
        for (const capacity of baseProduct.capacities) {
          // Generate variant info
          const capacityUnit = baseProduct.capacityUnit || "kW";
          const variantName = baseProduct.variantFormat.replace('{capacity}', capacity);
          const variantSku = baseProduct.skuFormat.replace('{capacity}', capacity);
          const imageUrl = baseProduct.imageUrlTemplate.replace('{capacity}', capacity.toString().toLowerCase());
          
          // Look for existing product with this name
          const existingProduct = existingProductData[variantName];
          
          // Calculate properties
          const price = existingProduct?.price || generatePrice(baseProduct.name, capacity, capacityUnit);
          const area = existingProduct?.area_required || calculateArea(baseProduct.name, capacity, capacityUnit);
          const monthlySavings = existingProduct?.monthly_savings || calculateMonthlySavings(baseProduct.name, capacity, capacityUnit);
          const subsidyPercentage = capacityUnit === "kW" ? 35 : 0; // Only solar systems get subsidy
          const paybackPeriod = calculatePaybackPeriod(price, monthlySavings, subsidyPercentage);
          
          // Convert capacity to kW for consistent storage
          let capacityKw = capacity;
          if (capacityUnit === "W") {
            capacityKw = capacity / 1000;
          } else if (capacityUnit === "LPD") {
            capacityKw = capacity / 100; // Rough conversion for data consistency
          } else if (capacityUnit === "m") {
            capacityKw = capacity / 1000; // Very rough approximation
          } else if (capacityUnit === "HP") {
            capacityKw = capacity * 0.746; // HP to kW conversion
          }
          
          // Create variant
          const { data: variant, error: variantError } = await supabase
            .from('product_variants')
            .upsert({
              product_id: product.id,
              variant_name: variantName,
              variant_sku: variantSku,
              capacity_kw: capacityKw,
              price: price,
              subsidy_percentage: subsidyPercentage,
              area_required: area,
              monthly_savings: monthlySavings,
              installation_days: existingProduct?.installation_time || (capacityKw > 5 ? '7-10' : '3-5'),
              is_default: capacity === baseProduct.capacities[1] || baseProduct.capacities.length === 1, // Middle capacity is default typically
              image_url: existingProduct?.image_url || imageUrl,
              description: existingProduct?.description || baseProduct.description,
              specifications: existingProduct?.specifications,
              features: existingProduct?.features,
              payback_period: paybackPeriod,
              generation: baseProduct.generation || existingProduct?.generation,
              panel_type: baseProduct.panel_type || existingProduct?.panel_type,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (variantError) {
            console.error(`Error creating variant ${variantName}:`, variantError.message);
          } else {
            console.log(`Created variant: ${variant.variant_name} (ID: ${variant.id})`);
          }
        }
      }
    }
    
    console.log('\nProduct restructuring complete! Base products created:');
    Object.entries(createdProductIds).forEach(([name, id]) => {
      console.log(`- ${name} (ID: ${id})`);
    });
    
    // Verify variants
    const { data: variants, error: variantError } = await supabase
      .from('product_variants')
      .select('product_id, variant_name')
      .order('variant_name');
    
    if (!variantError) {
      console.log(`\nTotal variants created: ${variants.length}`);
    }
    
  } catch (err) {
    console.error('Unexpected error during restructuring:', err);
  }
}

// Run the script
restructureProducts().then(() => console.log('\nDone!'));
