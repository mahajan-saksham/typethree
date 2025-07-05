import { supabase } from '../src/lib/supabaseClient.js';

// Function to fetch and display the product_skus table structure and data
async function checkProductSkus() {
  try {
    // First, get the table definition by selecting the first row
    console.log('Fetching product_skus table structure...');
    const { data: sample, error: sampleError } = await supabase
      .from('product_skus')
      .select('*')
      .limit(1);

    if (sampleError) {
      throw sampleError;
    }

    // Check structure based on the column names
    if (sample && sample.length > 0) {
      console.log('\nProduct SKU Table Structure:');
      console.log('==========================');
      const columns = Object.keys(sample[0]);
      columns.forEach(column => {
        const value = sample[0][column];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`${column}: ${type}`);
      });
    } else {
      console.log('No sample data found to determine structure.');
    }

    // Now fetch actual data
    console.log('\nFetching product_skus data...');
    const { data, error } = await supabase
      .from('product_skus')
      .select('*, product_categories(*), product_variants(*)')
      .limit(3);

    if (error) {
      throw error;
    }

    console.log('\nProduct SKUs with related data:');
    console.log('==============================');
    console.log(JSON.stringify(data, null, 2));
    console.log(`\nTotal records fetched: ${data.length}`);

  } catch (error) {
    console.error('Error fetching product_skus data:', error);
  }
}

// Execute the function
checkProductSkus();
