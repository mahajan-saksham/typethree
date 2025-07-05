// Script to generate product listing meta data for CSV upload

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

// Function to generate meta description from product data
function generateMetaDescription(product) {
  const capacity = product.capacity_kw ? `${product.capacity_kw}kW ` : '';
  const category = product.product_categories?.name || product.category || '';
  const savings = product.monthly_savings ? `₹${product.monthly_savings}/month savings. ` : '';
  const subsidyPercentage = product.subsidy_percentage || 35; // Default to 35% if not specified
  
  return `${capacity}${category} solar system from Type 3 Energy. ${savings}Get ${subsidyPercentage}% government subsidy. Clean energy solution for your home or business. Contact us today!`;
}

// Function to generate meta title from product data
function generateMetaTitle(product) {
  const capacity = product.capacity_kw ? `${product.capacity_kw}kW ` : '';
  const category = product.product_categories?.name || product.category || '';
  
  return `${capacity}${category} | Type 3 Energy Solar Solutions`;
}

// Function to clean the product name for use in URL slugs
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .trim();
}

async function generateProductMetaCSV() {
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
    
    // Create CSV header
    const csvHeader = 'ID,Name,URL,Meta Title,Meta Description,Image URL,Category,Price,Original Price,Subsidy Percentage,Capacity (kW),Monthly Savings,Installation Time,Area Required';
    
    // Generate CSV rows
    const csvRows = products.map(product => {
      const id = escapeCSV(product.id);
      const name = escapeCSV(product.name);
      const slug = createSlug(product.name);
      const url = escapeCSV(`${baseUrl}${product.id}-${slug}`);
      const metaTitle = escapeCSV(generateMetaTitle(product));
      const metaDescription = escapeCSV(generateMetaDescription(product));
      const imageUrl = escapeCSV(product.image_url || '');
      const category = escapeCSV(product.product_categories?.name || product.category || '');
      const price = escapeCSV(product.price || 0);
      const originalPrice = escapeCSV(product.original_price || product.price || 0);
      const subsidyPercentage = escapeCSV(product.subsidy_percentage || 35);
      const capacityKw = escapeCSV(product.capacity_kw || 0);
      const monthlySavings = escapeCSV(product.monthly_savings || 0);
      const installationTime = escapeCSV(product.installation_time || '');
      const areaRequired = escapeCSV(product.area_required || 0);
      
      // Combine all fields into a CSV row
      return [
        id,
        name,
        url,
        metaTitle,
        metaDescription,
        imageUrl,
        category,
        price,
        originalPrice,
        subsidyPercentage,
        capacityKw,
        monthlySavings,
        installationTime,
        areaRequired
      ].join(',');
    });
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Write to file
    const outputPath = path.join(__dirname, '../exports/product-meta.csv');
    
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`CSV file generated successfully at: ${outputPath}`);
    console.log('\nSample product links for meta CSV upload:');
    
    // Display sample links in the console
    products.slice(0, 10).forEach(product => {
      const slug = createSlug(product.name);
      console.log(`${product.name}: ${baseUrl}${product.id}-${slug}`);
    });
    
    // Also generate a simple text file with just the URLs and meta info
    const urlList = products.map(product => {
      const slug = createSlug(product.name);
      const url = `${baseUrl}${product.id}-${slug}`;
      const title = generateMetaTitle(product);
      const description = generateMetaDescription(product);
      return `URL: ${url}\nTitle: ${title}\nDescription: ${description}\n`;
    }).join('\n---\n\n');
    
    fs.writeFileSync(path.join(__dirname, '../exports/product-urls.txt'), urlList);
    console.log(`\nProduct URLs with meta info also saved to: ${path.join(__dirname, '../exports/product-urls.txt')}`);
    
  } catch (error) {
    console.error('Error generating product meta CSV:', error);
  }
}

// Run the function
generateProductMetaCSV();
