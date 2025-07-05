import { supabase } from '../lib/supabaseClient';
import { Product, ProductVariant, PRICE_PER_KW } from '../types/productTypes';

/**
 * Fetches all variants for a specific product
 * 
 * @param productId The ID of the product to fetch variants for
 * @returns Array of product variants or empty array if none found
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('capacity_kw', { ascending: true });
      
    if (error) {
      console.error('Error fetching variants:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProductVariants:', error);
    return [];
  }
}

/**
 * Fetches the default variant for a product
 * 
 * @param productId The ID of the product to fetch the default variant for
 * @returns The default variant or null if not found
 */
export async function getDefaultVariant(productId: string): Promise<ProductVariant | null> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_default', true)
      .single();
      
    if (error) {
      console.error('Error fetching default variant:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDefaultVariant:', error);
    return null;
  }
}

/**
 * Checks if a product has variants
 * 
 * @param product The product to check
 * @returns True if the product has variants, false otherwise
 */
export function hasVariants(product: Product): boolean {
  return Boolean(product.default_variant || (product.variants && product.variants.length > 0) || (product as any).default_variant_id);
}

/**
 * Fetches products with their categories from the database
 * 
 * @returns Array of products with their categories
 */
export async function getProductsWithCategories(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('product_skus')
      .select(`
        *,
        product_categories(id, name, icon_name)
      `)
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching products with categories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProductsWithCategories:', error);
    return [];
  }
}

/**
 * Fetches a product with all its variants from the database
 * 
 * @param productId The ID of the product to fetch
 * @returns The product with its variants or null if not found
 */
export async function getProductWithVariants(productId: string): Promise<Product | null> {
  try {
    // Fetch the product from product_skus table
    console.log('Fetching product from product_skus table with ID:', productId);
    const { data: product, error: productError } = await supabase
      .from('product_skus')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (productError) {
      console.error('Error fetching product:', productError);
      return null;
    }
    
    // Check if product_variants table exists (database might not be migrated yet)
    try {
      // Fetch the variants for this product
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('capacity_kw', { ascending: true });
      
      if (variantsError) {
        console.error('Error fetching variants:', variantsError);
        // Simulate variants if database tables don't exist yet
        return simulateProductWithVariants(product);
      }
      
      if (variants && variants.length > 0) {
        // Return the product with its variants from database
        return { ...product, variants, has_variants: true };
      } else {
        // No variants found in the database, simulate them
        return simulateProductWithVariants(product);
      }
    } catch (error) {
      // If any error occurs (like table not existing), simulate variants
      console.warn('Using simulated variants due to database error:', error);
      return simulateProductWithVariants(product);
    }
  } catch (error) {
    console.error('Unexpected error in getProductWithVariants:', error);
    return null;
  }
}

/**
 * Creates a simulated product with variants when database implementation is not available
 * 
 * @param product The base product to create variants for
 * @returns The product with simulated variants
 */
export function simulateProductWithVariants(product: Product): Product {
  const wattageOptions = [1, 2, 3, 5];
  const variants: ProductVariant[] = [];
  
  for (const wattage of wattageOptions) {
    const isDefault = wattage === product.capacity_kw;
    variants.push({
      id: `${product.id}-${wattage}kw`,
      product_id: product.id,
      capacity_kw: wattage,
      price: PRICE_PER_KW * wattage,
      subsidy_percentage: 35,
      area_required: 100 * wattage,
      monthly_savings: 1250 * wattage,
      installation_days: '4-5',
      is_default: isDefault,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return { ...product, variants, has_variants: true };
}

/**
 * Creates or updates a product variant
 * 
 * @param variant The variant data to save
 * @returns The created/updated variant or null on error
 */
export async function upsertProductVariant(
  variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<ProductVariant | null> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .upsert({
        ...variant,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error upserting variant:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error in upsertProductVariant:', error);
    return null;
  }
}

/**
 * Creates default variants for a product based on standard wattage options
 * 
 * @param productId The ID of the product to create variants for
 * @param defaultCapacity The default capacity to mark as is_default
 * @returns Array of created variants or empty array on error
 */
export async function createDefaultVariants(
  productId: string,
  defaultCapacity: number = 1
): Promise<ProductVariant[]> {
  try {
    const wattageOptions = [1, 2, 3, 5];
    const createdVariants: ProductVariant[] = [];
    
    for (const wattage of wattageOptions) {
      const variant = {
        product_id: productId,
        capacity_kw: wattage,
        price: PRICE_PER_KW * wattage,
        subsidy_percentage: 35,
        area_required: 100 * wattage,
        monthly_savings: 1250 * wattage,
        installation_days: '4-5',
        is_default: wattage === defaultCapacity
      };
      
      const result = await upsertProductVariant(variant);
      if (result) createdVariants.push(result);
    }
    
    return createdVariants;
  } catch (error) {
    console.error('Error creating default variants:', error);
    return [];
  }
}

/**
 * Gets all products with their default variants
 * 
 * @returns Array of products with their default variants
 */
export async function getProductsWithDefaultVariants(): Promise<Product[]> {
  try {
    console.log('Fetching products from product_skus table...');
    
    // Get products from the product_skus table with their categories
    const { data: products, error } = await supabase
      .from('product_skus')
      .select(`
        *,
        product_categories(id, name, icon_name)
      `)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching products:', error);
      return getDemoProducts().map(mapProductWithDefaultVariant);
    }
    
    // If we found products, return them
    if (products && products.length > 0) {
      console.log('Found products in product_skus table:', products.length);
      
      // Transform products to ensure they have all required fields
      const transformedProducts = products.map((product: any) => ({
        id: product.id || `product-${Math.random().toString(36).substring(2, 9)}`,
        name: product.name || 'Unnamed Product',
        description: product.description || '',
        price: product.price || 70000,
        capacity_kw: product.capacity_kw || 1,
        installation_time: product.installation_time || '7-10 days',
        area_required: product.area_required || 100,
        monthly_savings: product.monthly_savings || 1250,
        subsidy_amount: product.subsidy_amount || 0,
        panel_type: product.panel_type || 'Monocrystalline',
        image_url: product.image_url || '/placeholder.jpg',
        sku: product.sku || `SKU-${Math.random().toString(36).substring(2, 7)}`,
        category: product.category || 'residential',
        features: Array.isArray(product.features) ? product.features : [],
        generation: product.generation || '3rd Gen',
        power: product.capacity_kw || 1
      }));
      
      return transformedProducts.map(mapProductWithDefaultVariant);
    }
    
    // If no products found, return demo products
    console.log('No products found in database, returning demo products');
    return getDemoProducts().map(mapProductWithDefaultVariant);
  } catch (error) {
    console.error('Error in getProductsWithDefaultVariants:', error);
    return getDemoProducts().map(mapProductWithDefaultVariant);
  }
}

/**
 * Helper function to add default variant to a product
 */
function mapProductWithDefaultVariant(product: Product): Product {
  const simulatedProduct = simulateProductWithVariants(product);
  const defaultVariant = simulatedProduct.variants?.find(v => v.is_default);
  return { ...simulatedProduct, default_variant: defaultVariant };
}

/**
 * Sets a product variant as the default
 * 
 * @param productId The ID of the product
 * @param variantId The ID of the variant to set as default
 * @returns True if successful, false otherwise
 */
export async function setDefaultVariant(productId: string, variantId: string): Promise<boolean> {
  try {
    // The database trigger will ensure only one default per product
    const { error } = await supabase
      .from('product_variants')
      .update({ is_default: true })
      .eq('id', variantId)
      .eq('product_id', productId);
      
    if (error) {
      console.error('Error setting default variant:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in setDefaultVariant:', error);
    return false;
  }
}

/**
 * Deletes a product variant
 * 
 * @param variantId The ID of the variant to delete
 * @returns True if successful, false otherwise
 */
/**
 * Returns a list of demo products when no products are available in the database
 * 
 * @returns Array of demo products
 */
export function getDemoProducts(): Product[] {
  return [
    {
      id: 'demo-product-1',
      name: 'Type 3 Solar Residential 3kW System',
      description: 'Perfect for residential homes, this 3kW system provides reliable energy with minimal roof space.',
      price: 210000,
      capacity_kw: 3,
      installation_time: '4-5 days',
      area_required: 300,
      monthly_savings: 3750,
      subsidy_amount: 73500,
      panel_type: 'Monocrystalline',
      image_url: '/products/residential-3kw.jpg',
      sku: 'TYPE3-RES-3KW',
      category: 'residential',
      features: ['High efficiency', '25-year warranty', 'Weather resistant', 'Zero maintenance'],
      generation: '3rd Gen',
      power: 3
    },
    {
      id: 'demo-product-2',
      name: 'Type 3 Commercial 5kW System',
      description: 'Designed for small businesses, this 5kW system maximizes energy production and ROI.',
      price: 350000,
      capacity_kw: 5,
      installation_time: '5-7 days',
      area_required: 500,
      monthly_savings: 6250,
      subsidy_amount: 122500,
      panel_type: 'Monocrystalline',
      image_url: '/products/commercial-5kw.jpg',
      sku: 'TYPE3-COM-5KW',
      category: 'commercial',
      features: ['High efficiency', '25-year warranty', 'Weather resistant', 'Zero maintenance'],
      generation: '3rd Gen',
      power: 5
    },
    {
      id: 'demo-product-3',
      name: 'Type 3 Industrial 10kW System',
      description: 'Our industrial-grade 10kW system provides maximum energy production for larger facilities.',
      price: 700000,
      capacity_kw: 10,
      installation_time: '10-14 days',
      area_required: 1000,
      monthly_savings: 12500,
      subsidy_amount: 245000,
      panel_type: 'Monocrystalline',
      image_url: '/products/industrial-10kw.jpg',
      sku: 'TYPE3-IND-10KW',
      category: 'industrial',
      features: ['High efficiency', '25-year warranty', 'Weather resistant', 'Zero maintenance'],
      generation: '3rd Gen',
      power: 10
    }
  ];
}

export async function deleteVariant(variantId: string): Promise<boolean> {
  try {
    // Check if this is the only variant or a default variant
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('product_id, is_default')
      .eq('id', variantId)
      .single();
      
    if (variantError) {
      console.error('Error fetching variant for deletion:', variantError);
      return false;
    }
    
    // Count other variants for this product
    const { count, error: countError } = await supabase
      .from('product_variants')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', variant.product_id);
      
    if (countError) {
      console.error('Error counting variants:', countError);
      return false;
    }
    
    // Don't allow deletion if this is the only variant
    if (!count || count <= 1) {
      console.error('Cannot delete the only variant of a product');
      return false;
    }
    
    // If this is the default variant, set another one as default first
    if (variant.is_default) {
      const { data: otherVariant, error: otherError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', variant.product_id)
        .neq('id', variantId)
        .limit(1)
        .single();
        
      if (otherError) {
        console.error('Error finding another variant to set as default:', otherError);
        return false;
      }
      
      // Set the other variant as default
      const success = await setDefaultVariant(variant.product_id, otherVariant.id);
      if (!success) {
        return false;
      }
    }
    
    // Now delete the variant
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);
      
    if (deleteError) {
      console.error('Error deleting variant:', deleteError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in deleteVariant:', error);
    return false;
  }
}
