import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { 
  Product, 
  ProductVariant, 
  ProductWithDefaultVariant,
  ProductDetail,
  ProductImage
} from '../types/product';

/**
 * Applies the database migration for the product schema
 * This should be run by an admin user
 */
export async function applyProductSchemaMigration() {
  try {
    // Read the migration SQL
    const migrationSql = await fetch('/src/database/migrations/001_product_schema_with_variants.sql').then(res => res.text());
    
    // Execute migration using admin client
    const { error } = await supabaseAdmin.rpc('apply_migration', {
      name: 'product_schema_with_variants',
      sql: migrationSql
    });
    
    if (error) throw error;
    
    // Insert sample data
    const sampleDataSql = await fetch('/src/database/migrations/002_sample_product_data.sql').then(res => res.text());
    
    const { error: sampleDataError } = await supabaseAdmin.rpc('apply_migration', {
      name: 'sample_product_data',
      sql: sampleDataSql
    });
    
    if (sampleDataError) throw sampleDataError;
    
    return { success: true };
  } catch (error) {
    console.error('Error applying product schema migration:', error);
    return { success: false, error };
  }
}

/**
 * Gets all products with their default variants
 * Used for product listings
 */
export async function getProductsWithDefaultVariants({ 
  categories = null, 
  useCases = null,
  limit = 100,
  offset = 0,
  orderBy = 'name'
}: {
  categories?: string[] | null;
  useCases?: string[] | null;
  limit?: number;
  offset?: number;
  orderBy?: string;
} = {}): Promise<{ data: ProductWithDefaultVariant[] | null; error: any }> {
  try {
    // Base query
    let query = supabase
      .from('product_skus')
      .select(`
        *,
        category:product_categories(*),
        default_variant:product_variants(*)
        images:product_images(*)
      `)
      .eq('is_active', true)
      .eq('product_variants.is_default', true)
      .eq('product_images.is_primary', true)
      .order(orderBy)
      .range(offset, offset + limit - 1);
    
    // Apply category filter if provided
    if (categories && categories.length > 0) {
      query = query.in('category_id', categories);
    }
    
    // Apply use case filter if provided
    if (useCases && useCases.length > 0) {
      // Find products where ANY of the use cases match
      query = query.overlaps('use_cases', useCases);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform data to have default_variant as a single object instead of an array
    const transformedData = data?.map(product => ({
      ...product,
      default_variant: product.default_variant?.[0] || null,
      primary_image: product.images?.[0] || null,
      images: undefined // Remove the images array as we only want primary_image
    }));
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching products with default variants:', error);
    return { data: null, error };
  }
}

/**
 * Gets a product by slug with all variants and images
 * Used for product detail pages
 */
export async function getProductBySlug(slug: string): Promise<{ data: ProductDetail | null; error: any }> {
  try {
    // Get product with relations
    const { data, error } = await supabase
      .from('product_skus')
      .select(`
        *,
        category:product_categories(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    
    // Sort variants by capacity
    if (data?.variants) {
      data.variants.sort((a, b) => a.capacity_kw - b.capacity_kw);
    }
    
    // Sort images by display order
    if (data?.images) {
      data.images.sort((a, b) => a.display_order - b.display_order);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return { data: null, error };
  }
}

/**
 * Gets all product variants for a product
 */
export async function getProductVariants(productId: string): Promise<{ data: ProductVariant[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('capacity_kw');
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching variants for product ${productId}:`, error);
    return { data: null, error };
  }
}

/**
 * Creates or updates a product variant
 * Admin function
 */
export async function upsertProductVariant(
  variant: Partial<ProductVariant> & { product_id: string }
): Promise<{ data: ProductVariant | null; error: any }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .upsert(variant)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error upserting product variant:', error);
    return { data: null, error };
  }
}

/**
 * Creates or updates a product
 * Admin function
 */
export async function upsertProduct(
  product: Partial<Product> & { name: string; slug: string; sku: string }
): Promise<{ data: Product | null; error: any }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_skus')
      .upsert(product)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error upserting product:', error);
    return { data: null, error };
  }
}

/**
 * Calculates ROI and payback period for a product variant
 */
export function calculateProductROI(variant: ProductVariant): {
  subsidizedPrice: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  twentyFiveYearSavings: number;
} {
  // Ensure we have the required values with fallbacks
  const subsidizedPrice = variant.subsidized_price || variant.price * (1 - (variant.subsidy_percentage || 0) / 100);
  const monthlySavings = variant.monthly_savings || 0;
  const annualSavings = monthlySavings * 12;
  
  // Calculate payback period in years
  const paybackYears = monthlySavings > 0 ? subsidizedPrice / annualSavings : 99;
  
  // Calculate 25-year savings
  const twentyFiveYearSavings = annualSavings * 25;
  
  return {
    subsidizedPrice,
    monthlySavings,
    annualSavings,
    paybackYears,
    twentyFiveYearSavings
  };
}
