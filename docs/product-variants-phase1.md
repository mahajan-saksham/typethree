# Product Variant Management Implementation Guide - Phase 1

## Phase 1: Foundation & Data Structure

This document covers the first phase of implementing product variant management for the Type 3 Energy Admin interface, focusing on establishing the core data structures and foundational components.

### Chunk 1A: Interface Updates

#### Task 1A.1: Update ProductSKU Interface
```typescript
// From ProductSKUs.tsx
interface ProductSKU {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  capacity_kw?: number;
  installation_time?: string;
  area_required?: number;
  monthly_savings?: number;
  subsidy_amount?: number;
  panel_type?: string;
  image_url?: string;
  category: string;
  category_id?: string; // Foreign key to product_categories
  features?: string[];
  // New fields for variant support
  default_variant_id?: string; // Reference to default variant
  has_variants?: boolean; // Helper field for UI
}
```

#### Task 1A.2: Create ProductVariant Interface
```typescript
// New interface for product variants
interface ProductVariant {
  id: string;
  product_id: string; // Foreign key to product_skus
  variant_name?: string;
  variant_sku?: string;
  capacity_kw: number;
  price: number;
  subsidy_percentage: number;
  area_required: number;
  monthly_savings: number;
  installation_days: string;
  is_default: boolean;
  image_url?: string;
  description?: string;
  features?: string[];
  panel_type?: string;
  created_at?: string;
  updated_at?: string;
}
```

#### Task 1A.3: Add Helper Types for Form Handling
```typescript
// Form validation state type
type VariantFormErrors = {
  variant_name?: string;
  capacity_kw?: string;
  price?: string;
  subsidy_percentage?: string;
  area_required?: string;
  monthly_savings?: string;
  installation_days?: string;
};

// Product with variants type
type ProductWithVariants = ProductSKU & {
  variants?: ProductVariant[];
};
```

### Chunk 1B: Basic Data Fetching

#### Task 1B.1: Fetch Products with Categories
```typescript
// In productUtils.ts
export async function getProductsWithCategories(): Promise<ProductSKU[]> {
  try {
    const { data, error } = await supabase
      .from('product_skus')
      .select(`
        *,
        product_categories(id, name, icon_name)
      `)
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProductsWithCategories:', error);
    return [];
  }
}
```

#### Task 1B.2: Fetch Product Variants
```typescript
// In productUtils.ts
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
```

#### Task 1B.3: Check for Variants
```typescript
// In productUtils.ts
export function hasVariants(product: ProductSKU): boolean {
  return Boolean(product.default_variant_id);
}

// Get default variant for a product
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
```

### Chunk 1C: State Management Setup

#### Task 1C.1: Add Variant-Related State
```typescript
// In ProductSKUs.tsx component
const [variants, setVariants] = useState<ProductVariant[]>([]);
const [isLoadingVariants, setIsLoadingVariants] = useState(false);
const [activeTab, setActiveTab] = useState('product'); // 'product' or 'variants'
```

#### Task 1C.2: Create Active Variant State
```typescript
// In ProductSKUs.tsx component
const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);
const [isEditingVariant, setIsEditingVariant] = useState(false);
const [isAddingVariant, setIsAddingVariant] = useState(false);
```

#### Task 1C.3: Add Loading States
```typescript
// In ProductSKUs.tsx component
const [isVariantSaving, setIsVariantSaving] = useState(false);
const [isVariantDeleting, setIsVariantDeleting] = useState(false);
const [variantActionError, setVariantActionError] = useState<string | null>(null);

// Reset variant states function
const resetVariantStates = () => {
  setActiveVariant(null);
  setIsEditingVariant(false);
  setIsAddingVariant(false);
  setIsVariantSaving(false);
  setIsVariantDeleting(false);
  setVariantActionError(null);
};
```

## Implementation Steps

1. First, update the interfaces in `types/productTypes.ts` or directly in `ProductSKUs.tsx`
2. Add the variant fetching functions to `utils/productUtils.ts`
3. Set up the state management in the `ProductSKUs.tsx` component
4. Test the data fetching functions by temporarily logging the results

## Dependencies

- Supabase client for database interactions
- React useState for state management
- Existing ProductSKUs component structure
- Tailwind CSS for styling (maintaining Type 3 Energy's UI consistency)
