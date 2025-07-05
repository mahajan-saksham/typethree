// Script to generate product listing in Meta Catalog CSV format

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzY1ODQsImV4cCI6MjA1OTI1MjU4NH0.seU-MjLZ3ze6b22InyZA-SCPg64fVPTC8Lnnnj0-Aps';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base URL for product pages
const baseUrl = 'https://type3solar.in/products/';

// Function to escape CSV fields properly
function escapeCSV(field) {
  if (field === null || field === undefined) return '';
  const stringField = String(field);
  // If the field contains quotes, commas, or newlines, wrap it in quotes and escape internal quotes
  if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
    return '"' + stringField.replace(/"/g, '""') + '"';
  }
  return stringField;
}

// Function to create slug from product name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .trim();
}

// Function to generate enhanced product description
function generateDescription(product) {
  const capacity = product.capacity_kw ? `${product.capacity_kw}kW ` : '';
  const category = product.product_categories?.name || product.category || '';
  const description = product.description || '';
  
  let specs = [];
  if (product.specifications && typeof product.specifications === 'object') {
    try {
      // Extract key specifications for the description
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (value) specs.push(`${key}: ${value}`);
      });
    } catch (e) {
      console.error('Error parsing specifications:', e);
    }
  }
  
  const specText = specs.length > 0 ? `\n\nSpecifications:\n${specs.join('\n')}` : '';
  const subsidyText = product.subsidy_percentage ? `\n\nEligible for ${product.subsidy_percentage}% government subsidy.` : '';
  const savingsText = product.monthly_savings ? `\n\nEstimated monthly savings: ₹${product.monthly_savings}.` : '';
  
  return `${capacity}${category} solar system from Type 3 Energy. ${description}${specText}${subsidyText}${savingsText} Contact us today for installation details.`;
}

async function generateMetaCatalogCSV() {
  try {
    console.log('Fetching products from Supabase...');
    
    // Fetch all products with their categories
    const { data: products, error } = await supabase
      .from('product_skus')
      .select(`
        *,
        product_categories(*),
        product_variants(*)
      `);
    
    if (error) throw error;
    
    if (!products || products.length === 0) {
      console.log('No products found.');
      return;
    }
    
    console.log(`Found ${products.length} products.`);
    
    // Meta catalog header row - first line is the long comment row, second is the actual headers
    const headerComments = [
      '# Required | A unique content ID for the item. Use the item\'s SKU if you can. Each content ID must appear only once in your catalog. To run dynamic ads this ID must exactly match the content ID for the same item in your Meta Pixel code. Character limit: 100',
      '# Required | A specific and relevant title for the item. See title specifications: https://www.facebook.com/business/help/2104231189874655 Character limit: 200',
      '# Required | A short and relevant description of the item. Include specific or unique product features like material or color. Use plain text and don\'t enter text in all capital letters. See description specifications: https://www.facebook.com/business/help/2302017289821154 Character limit: 9999',
      '# Required | The current availability of the item. | Supported values: in stock; out of stock',
      '# Required | The current condition of the item. | Supported values: new; used',
      '# Required | The price of the item. Format the price as a number followed by the 3-letter currency code (ISO 4217 standards). Use a period (.) as the decimal point; don\'t use a comma.',
      '# Required | The URL of the specific product page where people can buy the item.',
      '# Required | The URL for the main image of your item. Images must be in a supported format (JPG/GIF/PNG) and at least 500 x 500 pixels.',
      '# Required | The brand name of the item. Character limit: 100.',
      '# Optional | The Google product category for the item. Learn more about product categories: https://www.facebook.com/business/help/526764014610932.',
      '# Optional | The Facebook product category for the item. Learn more about product categories: https://www.facebook.com/business/help/526764014610932.',
      '# Optional | The quantity of this item you have to sell on Facebook and Instagram with checkout. Must be 1 or higher or the item won\'t be buyable',
      '# Optional | The discounted price of the item if it\'s on sale. Format the price as a number followed by the 3-letter currency code (ISO 4217 standards). Use a period (.) as the decimal point; don\'t use a comma. A sale price is required if you want to use an overlay for discounted prices.',
      '# Optional | The time range for your sale period. Includes the date and time/time zone when your sale starts and ends. If this field is blank any items with a sale_price remain on sale until you remove the sale price. Use this format: YYYY-MM-DDT23:59+00:00/YYYY-MM-DDT23:59+00:00. Enter the start date as YYYY-MM-DD. Enter a \'T\'. Enter the start time in 24-hour format (00:00 to 23:59) followed by the UTC time zone (-12:00 to +14:00). Enter \'/ and then repeat the same format for your end date and time. The example row below uses PST time zone (-08:00).',
      '# Optional | Use this field to create variants of the same item. Enter the same group ID for all variants within a group. Learn more about variants: https://www.facebook.com/business/help/2256580051262113 Character limit: 100.',
      '# Optional | The gender of a person that the item is targeted towards. | Supported values: female; male; unisex',
      '# Optional | The color of the item. Use one or more words to describe the color. Don\'t use a hex code. Character limit: 200.',
      '# Optional | The size of the item written as a word or abbreviation or number. For example: small; XL; 12. Character limit: 200.',
      '# Optional | The age group that the item is targeted towards. | Supported values: adult; all ages; infant; kids; newborn; teen; toddler',
      '# Optional | The material the item is made from; such as cotton; denim or leather. Character limit: 200.',
      '# Optional | The pattern or graphic print on the item. Character limit: 100.'
    ].join(',');
    
    const headers = [
      'id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand',
      'google_product_category', 'fb_product_category', 'quantity_to_sell_on_facebook', 'sale_price',
      'sale_price_effective_date', 'item_group_id', 'gender', 'color', 'size', 'age_group', 'material',
      'pattern'
    ].join(',');
    
    // Map products to Meta catalog format
    const csvRows = products.map(product => {
      const id = escapeCSV(product.id);
      const name = escapeCSV(product.name);
      const capacity = product.capacity_kw ? `${product.capacity_kw}kW ` : '';
      const categoryName = product.product_categories?.name || product.category || '';
      const title = escapeCSV(`${capacity}${categoryName} - ${name}`);
      
      const description = escapeCSV(generateDescription(product));
      const availability = 'in stock'; // Assuming all products are in stock
      const condition = 'new'; // Assuming all products are new
      
      // Format price as required by Meta: number followed by currency code
      const price = `${product.price || 0}.00 INR`;
      
      // Create product URL
      const slug = createSlug(product.name);
      const link = escapeCSV(`${baseUrl}${product.id}-${slug}`);
      
      // Image URL (use placeholder if not available)
      const imageLink = escapeCSV(product.image_url || 'https://type3solar.in/images/product-placeholder.jpg');
      
      // Brand
      const brand = 'Type 3 Energy';
      
      // Google and Facebook product categories
      let googleCategory = '';
      let fbCategory = '';
      
      // Map product categories to Google/FB categories
      if (categoryName.toLowerCase().includes('solar panel') || categoryName.toLowerCase().includes('on-grid') || 
          categoryName.toLowerCase().includes('off-grid') || categoryName.toLowerCase().includes('hybrid')) {
        googleCategory = 'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Alternative Energy Equipment > Solar Panels';
        fbCategory = 'Home & Garden > Lawn & Garden > Outdoor Power Equipment';
      } else if (categoryName.toLowerCase().includes('water heat')) {
        googleCategory = 'Home & Garden > Household Appliances > Climate Control Appliances > Water Heaters';
        fbCategory = 'Home & Garden > Household Appliances';
      } else if (categoryName.toLowerCase().includes('light')) {
        googleCategory = 'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Outdoor Lighting';
        fbCategory = 'Home & Garden > Lawn & Garden > Outdoor Power Equipment';
      } else if (categoryName.toLowerCase().includes('pump')) {
        googleCategory = 'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Water Pumps';
        fbCategory = 'Home & Garden > Lawn & Garden > Outdoor Power Equipment';
      } else if (categoryName.toLowerCase().includes('fence')) {
        googleCategory = 'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Alternative Energy Equipment';
        fbCategory = 'Home & Garden > Lawn & Garden > Outdoor Power Equipment';
      }
      
      // Quantity - default to 10 for each product
      const quantity = '10';
      
      // Sale price (if applicable)
      const salePrice = product.original_price && product.original_price > product.price ? 
        `${product.price || 0}.00 INR` : '';
      
      // Sale period (leaving blank)
      const salePeriod = '';
      
      // Item group ID for variants (using product SKU if available)
      const itemGroupId = product.sku || '';
      
      // Other optional fields
      const gender = 'unisex'; // Not applicable for solar products
      const color = ''; // Not applicable
      const size = product.capacity_kw ? `${product.capacity_kw}kW` : ''; // Use capacity as size
      const ageGroup = 'adult'; // Default
      const material = ''; // Not applicable
      const pattern = ''; // Not applicable
      
      // Combine all fields into a CSV row
      return [
        id, title, description, availability, condition, price, link, imageLink, brand,
        googleCategory, fbCategory, quantity, salePrice, salePeriod, itemGroupId,
        gender, color, size, ageGroup, material, pattern
      ].join(',');
    });
    
    // Combine header comments, headers and rows
    const csvContent = [headerComments, headers, ...csvRows].join('\n');
    
    // Write to file
    const outputPath = path.join(__dirname, '../exports/meta-catalog-products.csv');
    
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`Meta catalog CSV file generated successfully at: ${outputPath}`);
    console.log('\nThis file is formatted according to Meta Catalog requirements and is ready for upload.');
    
  } catch (error) {
    console.error('Error generating Meta catalog CSV:', error);
  }
}

// Run the function
generateMetaCatalogCSV();
