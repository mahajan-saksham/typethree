import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzY1ODQsImV4cCI6MjA1OTI1MjU4NH0.seU-MjLZ3ze6b22InyZA-SCPg64fVPTC8Lnnnj0-Aps';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeProductSkus() {
  try {
    console.log('Fetching all product SKUs...');
    
    // Fetch all products
    const { data: products, error } = await supabase
      .from('product_skus')
      .select('*');
    
    if (error) throw error;
    
    console.log(`Found ${products.length} product SKUs.\n`);
    
    // Analyze the structure
    if (products.length === 0) {
      console.log('No products found in the database.');
      return;
    }
    
    // Get all unique column names across all products
    const allColumns = new Set();
    products.forEach(product => {
      Object.keys(product).forEach(key => allColumns.add(key));
    });
    
    console.log('=== DATABASE SCHEMA ANALYSIS ===');
    console.log(`Total columns found: ${allColumns.size}`);
    console.log('Column names: ' + Array.from(allColumns).join(', ') + '\n');
    
    // Analyze each column
    console.log('=== COLUMN DETAILS ===');
    const columnStats = {};
    
    Array.from(allColumns).forEach(column => {
      columnStats[column] = {
        nonNullCount: 0,
        types: new Set(),
        values: new Set(),
        min: null,
        max: null,
        example: null
      };
      
      products.forEach(product => {
        const value = product[column];
        
        if (value !== null && value !== undefined) {
          columnStats[column].nonNullCount++;
          columnStats[column].types.add(typeof value);
          
          // Store example value
          if (columnStats[column].example === null) {
            columnStats[column].example = value;
          }
          
          // For numeric values, track min/max
          if (typeof value === 'number') {
            if (columnStats[column].min === null || value < columnStats[column].min) {
              columnStats[column].min = value;
            }
            if (columnStats[column].max === null || value > columnStats[column].max) {
              columnStats[column].max = value;
            }
          }
          
          // For string/boolean/small values, collect unique values (limit to 10)
          if (typeof value === 'string' || typeof value === 'boolean' || 
              (typeof value === 'number' && columnStats[column].values.size < 10)) {
            columnStats[column].values.add(String(value));
          }
        }
      });
    });
    
    // Print column statistics
    Object.entries(columnStats).forEach(([column, stats]) => {
      console.log(`Column: ${column}`);
      console.log(`  - Non-null values: ${stats.nonNullCount}/${products.length} (${Math.round(stats.nonNullCount/products.length*100)}%)`);
      console.log(`  - Data types: ${Array.from(stats.types).join(', ')}`);
      
      if (stats.min !== null) {
        console.log(`  - Range: ${stats.min} to ${stats.max}`);
      }
      
      if (stats.values.size > 0 && stats.values.size <= 10) {
        console.log(`  - Unique values: ${Array.from(stats.values).join(', ')}`);
      } else if (stats.values.size > 10) {
        console.log(`  - Unique values: ${stats.values.size} different values`);
      }
      
      console.log(`  - Example: ${JSON.stringify(stats.example).substring(0, 100)}${JSON.stringify(stats.example).length > 100 ? '...' : ''}`);
      console.log();
    });
    
    // Analyze JSON columns in more detail
    console.log('=== JSON COLUMN ANALYSIS ===');
    ['features', 'specifications', 'images'].forEach(jsonColumn => {
      if (!allColumns.has(jsonColumn)) return;
      
      console.log(`Analyzing ${jsonColumn} column:`);
      const jsonStructure = new Set();
      
      products.forEach(product => {
        const value = product[jsonColumn];
        if (value) {
          try {
            // Parse JSON if it's a string
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            
            if (Array.isArray(parsed)) {
              console.log(`  - Product ${product.id}: Array with ${parsed.length} items`);
              if (parsed.length > 0) {
                console.log(`    - Example item: ${JSON.stringify(parsed[0]).substring(0, 100)}`);
              }
            } else if (typeof parsed === 'object') {
              const keys = Object.keys(parsed);
              jsonStructure.add(keys.join(','));
              console.log(`  - Product ${product.id}: Object with keys: ${keys.join(', ')}`);
            }
          } catch (e) {
            console.log(`  - Product ${product.id}: Invalid JSON`);
          }
        }
      });
      
      console.log(`  - Unique structures found: ${jsonStructure.size}`);
      console.log();
    });
    
    // Print sample product
    console.log('=== SAMPLE PRODUCT ===');
    const sampleProduct = products[0];
    console.log(JSON.stringify(sampleProduct, null, 2));
    
  } catch (error) {
    console.error('Error analyzing product SKUs:', error);
  }
}

analyzeProductSkus();
