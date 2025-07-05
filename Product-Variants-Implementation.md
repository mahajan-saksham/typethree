# Type 3 Energy - Product Variants Implementation

## Overview

This document outlines the technical implementation plan for enhancing the product details system to support multiple capacity variants per product. Each product will have multiple capacity options (e.g., 1kW, 2kW, 3kW, 5kW) with variant-specific pricing, subsidies, installation times, and performance characteristics.

## Implementation Progress

### ✅ Phase 1: Frontend Implementation (Completed)

1. Created TypeScript interfaces for Product and ProductVariant
2. Added simulation logic for creating variants (to be replaced with DB queries)
3. Updated ProductDetail component with variant switcher UI
4. Implemented dynamic:  
   - Capacity display
   - Area required calculations
   - Installation time
   - Pricing with subsidy
   - ROI estimator with monthly savings and payback period
5. Fixed integration with SiteVisitForm

These changes provide a functional prototype that allows users to switch between different system sizes and see all specifications, pricing, and calculations update dynamically.

### ✅ Phase 2: Database Implementation (Completed)

1. Created Supabase SQL migration scripts:
   - Added `product_variants` table with capacity_kw, price, subsidy_percentage, etc.
   - Updated `products` table with has_variants flag
   - Added database triggers to ensure one default variant per product
   - Created helpful functions for variant management

2. Enhanced utility functions for database/variant operations:
   - Modified `getProductWithVariants` to work with actual DB or fall back to simulation
   - Created CRUD operations for variant management (create, update, delete)
   - Added `getProductsWithDefaultVariants` function for product listings
   - Implemented safety checks for variant operations

3. Updated the Products list component to display variant information:
   - Shows default variant capacity and price in product cards
   - Properly calculates ROI based on variant data
   - Links to ProductDetail with proper variant selection

The implementation includes graceful fallback to simulated variants when the database tables aren't yet available, providing a seamless development and migration path.

## Database Schema Changes

### 1. New Product Variants Table

```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  capacity_kw NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  subsidy_percentage NUMERIC DEFAULT 35,
  area_required NUMERIC,
  monthly_savings NUMERIC,
  installation_days TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Updates to Products Table

```sql
ALTER TABLE products 
  ADD COLUMN has_variants BOOLEAN DEFAULT true,
  ADD COLUMN variant_name TEXT DEFAULT 'Capacity';
```

## API Modifications

### 1. Fetch Product with Variants

```typescript
// GET /api/products/:productId
async function getProductWithVariants(productId: string) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (productError) {
    console.error('Error fetching product:', productError);
    return null;
  }
  
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('capacity_kw', { ascending: true });
  
  if (variantsError) {
    console.error('Error fetching variants:', variantsError);
    return { ...product, variants: [] };
  }
  
  return { ...product, variants };
}
```

### 2. Create/Update Product Variant

```typescript
// POST /api/products/:productId/variants
async function upsertProductVariant(productId: string, variantData: ProductVariant) {
  const { data, error } = await supabase
    .from('product_variants')
    .upsert({
      product_id: productId,
      ...variantData,
      updated_at: new Date()
    })
    .select();
    
  return { data, error };
}
```

## Frontend Component Updates

### 1. TypeScript Interfaces

```typescript
interface ProductVariant {
  id: string;
  product_id: string;
  capacity_kw: number;
  price: number;
  subsidy_percentage: number;
  area_required: number;
  monthly_savings: number;
  installation_days: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  panel_type: string;
  image_url: string;
  description?: string;
  has_variants: boolean;
  variant_name: string;
  variants?: ProductVariant[];
}
```

### 2. ProductDetail Component Updates

```typescript
// State management for variants
const [variants, setVariants] = useState<ProductVariant[]>([]);
const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

// Fetch product with variants
useEffect(() => {
  async function fetchProductWithVariants() {
    const productData = await getProductWithVariants(productId);
    setProduct(productData);
    
    if (productData?.variants && productData.variants.length > 0) {
      setVariants(productData.variants);
      
      // Set default variant
      const defaultVariant = productData.variants.find(v => v.is_default) || 
                        productData.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }
  
  fetchProductWithVariants();
}, [productId]);

// Calculate derived values
const calculatePriceAfterSubsidy = (variant: ProductVariant) => {
  return variant.price * (1 - (variant.subsidy_percentage / 100));
};

const calculate25YearSavings = (variant: ProductVariant) => {
  return variant.monthly_savings * 12 * 25;
};

const calculatePaybackYears = (variant: ProductVariant) => {
  const priceAfterSubsidy = calculatePriceAfterSubsidy(variant);
  return Math.round(priceAfterSubsidy / (variant.monthly_savings * 12));
};
```

### 3. Variant Switcher UI

```tsx
{/* Wattage Switcher */}
<div className="mb-8">
  <h3 className="text-xl font-semibold text-white mb-4">
    Select {product?.variant_name || 'System Size'}
  </h3>
  <div className="flex flex-wrap gap-3">
    {variants.map((variant) => (
      <button
        key={variant.id}
        onClick={() => setSelectedVariant(variant)}
        className={`px-6 py-3 rounded-lg font-medium ${
          selectedVariant?.id === variant.id
            ? 'bg-primary text-dark'
            : 'bg-dark-800 text-light/80 hover:bg-dark-700'
        } transition-colors duration-300`}
      >
        {variant.capacity_kw} kW
      </button>
    ))}
  </div>
  <p className="text-light/60 text-sm mt-2">
    Recommended for {
      selectedVariant?.capacity_kw === 1 ? 'small homes (1-2 rooms)' :
      selectedVariant?.capacity_kw === 2 ? 'medium homes (2-3 rooms)' :
      selectedVariant?.capacity_kw === 3 ? 'large homes (3-4 rooms)' :
      'very large homes or small businesses'
    }
  </p>
</div>
```

### 4. Dynamic Product Information Display

```tsx
{/* Price Display */}
<div className="flex items-baseline gap-2">
  <p className="text-lg line-through text-light/40">
    ₹{selectedVariant?.price.toLocaleString()}
  </p>
  <span className="text-sm font-medium text-primary">
    {selectedVariant?.subsidy_percentage}% off
  </span>
</div>
<p className="text-2xl sm:text-3xl font-bold text-light">
  ₹{calculatePriceAfterSubsidy(selectedVariant).toLocaleString()}
</p>

{/* ROI Estimator */}
<div className="bg-dark-900/30 backdrop-blur-sm p-6 rounded-xl border border-white/5 text-center">
  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
    <Clock size={28} className="text-primary" />
  </div>
  <h3 className="text-xl font-semibold text-white mb-2">Payback Period</h3>
  <p className="text-3xl font-bold text-primary">
    {calculatePaybackYears(selectedVariant)} years
  </p>
</div>
```

## Migration Strategy

### 1. Data Migration Script

```typescript
async function migrateExistingProducts() {
  // Get all existing products
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
    
  if (error || !products) {
    console.error('Error fetching products:', error);
    return;
  }
  
  // Standard wattage options
  const wattageOptions = [1, 2, 3, 5];
  
  // Process each product
  for (const product of products) {
    // For each product, create variants
    for (const wattage of wattageOptions) {
      const isDefault = wattage === product.capacity_kw;
      
      const variant = {
        product_id: product.id,
        capacity_kw: wattage,
        price: 70000 * wattage, // Rs. 70,000 per kW
        subsidy_percentage: 35,
        area_required: 100 * wattage, // 100 sq.ft per kW
        monthly_savings: 1250 * wattage, // Rs. 1,250 per kW
        installation_days: '4-5',
        is_default: isDefault
      };
      
      // Insert variant
      const { error: insertError } = await supabase
        .from('product_variants')
        .insert(variant);
        
      if (insertError) {
        console.error(`Error creating variant for product ${product.id}:`, insertError);
      }
    }
    
    // Update product to indicate it has variants
    const { error: updateError } = await supabase
      .from('products')
      .update({ has_variants: true })
      .eq('id', product.id);
      
    if (updateError) {
      console.error(`Error updating product ${product.id}:`, updateError);
    }
  }
  
  console.log('Migration completed');
}
```

### 2. Deployment Steps

1. **Database Schema Updates**
   - Create new `product_variants` table
   - Update `products` table with new columns

2. **Run Migration Script**
   - Execute data migration to create variants for existing products

3. **API Updates**
   - Deploy new API endpoints for variant handling
   - Update existing product endpoints to include variants

4. **Frontend Deployment**
   - Deploy updated ProductDetail component with variant support
   - Update admin interface to manage variants

## Testing Plan

### 1. Unit Tests

- Test variant selection logic
- Test price and subsidy calculations
- Test payback period and savings calculations

### 2. Integration Tests

- Verify product API returns correct variant data
- Test error handling when variants are missing
- Verify default variant selection works correctly

### 3. End-to-End Tests

- Verify switching between variants updates all displayed information
- Test that form submissions include the correct variant information
- Verify SEO metadata updates with variant information

## Future Enhancements

1. **Product Comparison**
   - Allow comparing different capacity options side by side

2. **Recommendation Engine**
   - Suggest optimal capacity based on user's electricity consumption

3. **Variant-specific Images**
   - Show different images for different capacity variants

4. **Custom Variant Attributes**
   - Support additional variant-specific attributes beyond capacity

## Conclusion

This implementation plan provides a flexible and maintainable approach to handling product variants with different capacities. By storing variant-specific data in the database, we enable dynamic pricing, accurate ROI calculations, and a better user experience with the ability to explore different system sizes directly on the product page.
