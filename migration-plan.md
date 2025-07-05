# Migration Plan: Reverting to Non-Variant Product Structure

## Overview

This document outlines the steps to migrate from the current product variant structure back to a simpler non-variant design. The migration will consolidate variant data into the main product_skus table and update the frontend code to work with this simplified structure.

## Database Changes

1. **Backup existing data**
   - Create backup tables for product_skus and product_variants

2. **Consolidate variant data into product_skus**
   - Update each product with data from its default variant
   - For products without a default variant, use the first available variant

3. **Remove variant-related columns and constraints**
   - Drop the foreign key constraint to product_variants
   - Remove the default_variant_id column

4. **Create compatibility view**
   - Create a product_variants_view to maintain compatibility with code expecting variants

## Frontend Code Updates

### Files to Update

1. **Product Types (`src/types/product.ts`)**
   - Remove variant-related interfaces
   - Simplify ProductSKU interface

2. **Products Page (`src/pages/Products.tsx`)**
   - Update data fetching to no longer request variants
   - Remove variant selection UI
   - Update product card rendering

3. **Product Detail Page (`src/pages/ProductDetail.tsx`)**
   - Remove variant selection UI
   - Update data fetching to use product_skus directly

4. **Admin Pages**
   - Update product management UI to remove variant management
   - Simplify product creation and editing forms

## Implementation Steps

### Step 1: Apply Database Migration

```bash
# Run the migration script
cd /Users/sakshammahajan/Documents/type\ 3/Project
supabase db push supabase/migrations/20250521000000_revert_to_non_variant_structure.sql
```

### Step 2: Update TypeScript Interfaces

Update the ProductSKU interface to remove variant references:

```typescript
// src/types/product.ts
export interface ProductSKU {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  capacity_kw: number;
  category_id: string;
  category?: string;
  image_url?: string;
  features?: string[];
  panel_type?: string;
  installation_time?: string;
  area_required?: number;
  monthly_savings?: number;
  subsidy_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

// Remove ProductVariant interface or mark as deprecated
```

### Step 3: Update Product Fetching Logic

Update the product fetching functions to no longer request variants:

```typescript
// Example update for fetching products
async function fetchProducts() {
  const { data, error } = await supabase
    .from('product_skus')
    .select(`
      *,
      product_categories(*)
    `);
    
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
}
```

### Step 4: Update Product Detail Page

Simplify the product detail page to work with the non-variant structure:

```typescript
// src/pages/ProductDetail.tsx
// Replace variant selection with direct product display
useEffect(() => {
  async function fetchProduct() {
    if (productId) {
      const { data, error } = await supabase
        .from('product_skus')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (data) {
        setProduct(data);
      } else {
        console.error('Error fetching product:', error);
      }
    }
    setLoading(false);
  }
  
  fetchProduct();
}, [productId]);
```

### Step 5: Update Admin Product Management

Simplify the product management UI in the admin dashboard:

1. Remove variant management tabs and forms
2. Update product creation and editing forms to include all fields directly
3. Remove variant-related API calls

### Step 6: Testing

1. Test product listing and filtering
2. Test product detail pages
3. Test admin product management
4. Verify all calculations (subsidy, savings, etc.) work correctly

### Step 7: Cleanup (After Verification)

Once everything is working correctly:

1. Remove the product_variants table
2. Remove any unused code related to variants
3. Clean up any compatibility views if no longer needed

## Rollback Plan

If issues are encountered:

1. Restore from the backup tables created during migration
2. Revert code changes
3. Test thoroughly before proceeding again
