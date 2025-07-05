# Product Variant Management Implementation Guide - Phase 5

## Phase 5: Product Creation with Variants

This document covers the fifth phase of implementing product variant management for the Type 3 Energy Admin interface, focusing on enhancing the product creation process to include initial variants.

### Chunk 5A: Product Form Enhancement

#### Task 5A.1: Add Variant Section to Product Form
```jsx
// In ProductSKUs.tsx - Add to product form
<div className="mt-6 border-t border-gray-200 pt-6">
  <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
  <p className="mt-1 text-sm text-gray-500">
    Add initial variants for this product. You must add at least one variant.
  </p>
  
  {initialVariants.map((variant, index) => (
    <div key={index} className="mt-4 border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-md font-medium text-gray-700">Variant {index + 1}</h4>
        {initialVariants.length > 1 && (
          <button
            type="button"
            onClick={() => removeInitialVariant(index)}
            className="text-red-600 hover:text-red-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`variant_name_${index}`} className="block text-sm font-medium text-gray-700">Variant Name</label>
          <input
            type="text"
            name={`variant_name_${index}`}
            id={`variant_name_${index}`}
            value={variant.variant_name}
            onChange={(e) => updateInitialVariant(index, 'variant_name', e.target.value)}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor={`capacity_kw_${index}`} className="block text-sm font-medium text-gray-700">Capacity (kW)</label>
          <input
            type="number"
            step="0.1"
            name={`capacity_kw_${index}`}
            id={`capacity_kw_${index}`}
            value={variant.capacity_kw}
            onChange={(e) => updateInitialVariant(index, 'capacity_kw', parseFloat(e.target.value) || 0)}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor={`price_${index}`} className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name={`price_${index}`}
            id={`price_${index}`}
            value={variant.price}
            onChange={(e) => updateInitialVariant(index, 'price', parseFloat(e.target.value) || 0)}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor={`subsidy_percentage_${index}`} className="block text-sm font-medium text-gray-700">Subsidy %</label>
          <input
            type="number"
            name={`subsidy_percentage_${index}`}
            id={`subsidy_percentage_${index}`}
            value={variant.subsidy_percentage}
            onChange={(e) => updateInitialVariant(index, 'subsidy_percentage', parseFloat(e.target.value) || 0)}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div className="sm:col-span-2">
          <div className="flex items-center">
            <input
              type="radio"
              name="default_variant"
              id={`default_variant_${index}`}
              checked={defaultVariantIndex === index}
              onChange={() => setDefaultVariantIndex(index)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor={`default_variant_${index}`} className="ml-2 block text-sm text-gray-900">
              Set as default variant
            </label>
          </div>
        </div>
      </div>
    </div>
  ))}
  
  <div className="mt-4">
    <button
      type="button"
      onClick={addInitialVariant}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Add Another Variant
    </button>
  </div>
</div>
```

#### Task 5A.2: Create UI for Multiple Initial Variants
```jsx
// In ProductSKUs.tsx - Add state for initial variants
const [initialVariants, setInitialVariants] = useState([
  {
    variant_name: '',
    capacity_kw: 1,
    price: 0,
    subsidy_percentage: 0,
    area_required: 0,
    monthly_savings: 0,
    installation_days: '7-10 days',
    is_default: true
  }
]);
const [defaultVariantIndex, setDefaultVariantIndex] = useState(0);

// Functions to manage initial variants
const addInitialVariant = () => {
  const lastVariant = initialVariants[initialVariants.length - 1];
  const newCapacity = lastVariant.capacity_kw + 1; // Increment capacity by 1
  
  setInitialVariants([
    ...initialVariants,
    {
      variant_name: `${newCapacity}kW Variant`,
      capacity_kw: newCapacity,
      price: lastVariant.price * (newCapacity / lastVariant.capacity_kw), // Scale price by capacity ratio
      subsidy_percentage: lastVariant.subsidy_percentage,
      area_required: lastVariant.area_required * (newCapacity / lastVariant.capacity_kw), // Scale area by capacity ratio
      monthly_savings: lastVariant.monthly_savings * (newCapacity / lastVariant.capacity_kw), // Scale savings by capacity ratio
      installation_days: lastVariant.installation_days,
      is_default: false
    }
  ]);
};

const removeInitialVariant = (indexToRemove) => {
  setInitialVariants(initialVariants.filter((_, index) => index !== indexToRemove));
  
  // Update default variant index if needed
  if (defaultVariantIndex === indexToRemove) {
    setDefaultVariantIndex(0); // Reset to first variant
  } else if (defaultVariantIndex > indexToRemove) {
    setDefaultVariantIndex(defaultVariantIndex - 1); // Adjust index if removing variant before default
  }
};

const updateInitialVariant = (index, field, value) => {
  const updatedVariants = [...initialVariants];
  updatedVariants[index] = { ...updatedVariants[index], [field]: value };
  setInitialVariants(updatedVariants);
};
```

#### Task 5A.3: Add Capacity Presets
```jsx
// In ProductSKUs.tsx - Add capacity preset functionality
const capacityPresets = [1, 2, 3, 5, 7, 10, 15, 20]; // Common capacity values in kW

const applyCapacityPreset = (index, preset) => {
  const variant = initialVariants[index];
  const capacityRatio = preset / variant.capacity_kw;
  
  // Scale values based on capacity ratio
  updateInitialVariant(index, 'capacity_kw', preset);
  updateInitialVariant(index, 'variant_name', `${preset}kW Variant`);
  updateInitialVariant(index, 'price', Math.round(variant.price * capacityRatio));
  updateInitialVariant(index, 'area_required', Math.round(variant.area_required * capacityRatio));
  updateInitialVariant(index, 'monthly_savings', Math.round(variant.monthly_savings * capacityRatio));
};

// Add preset selector to the variant form
<div className="mt-2">
  <label className="block text-sm font-medium text-gray-700">Quick Capacity Presets</label>
  <div className="mt-1 flex flex-wrap gap-2">
    {capacityPresets.map(preset => (
      <button
        key={preset}
        type="button"
        onClick={() => applyCapacityPreset(index, preset)}
        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {preset} kW
      </button>
    ))}
  </div>
</div>
```

### Chunk 5B: Product Creation Handler

#### Task 5B.1: Update Product Creation Logic
```jsx
// In ProductSKUs.tsx - Modify product form validation
const validateProductForm = () => {
  const errors = {};
  
  // Existing validation logic for product fields
  // ...
  
  // Validate variants
  if (initialVariants.length === 0) {
    errors.variants = 'At least one variant is required';
  } else {
    // Check if any variants have missing required fields
    const hasInvalidVariant = initialVariants.some(variant => {
      return !variant.variant_name || variant.capacity_kw <= 0 || variant.price < 0;
    });
    
    if (hasInvalidVariant) {
      errors.variants = 'All variants must have a name, positive capacity, and valid price';
    }
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
```

#### Task 5B.2: Implement Transaction-like Approach
```typescript
// In productUtils.ts
export async function createProductWithVariants(product: ProductSKU, variants: ProductVariant[]): Promise<{ data: ProductSKU | null, error: any }> {
  try {
    // 1. Create the product
    const { data: newProduct, error: productError } = await supabase
      .from('product_skus')
      .insert({
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        capacity_kw: product.capacity_kw,
        installation_time: product.installation_time,
        area_required: product.area_required,
        monthly_savings: product.monthly_savings,
        subsidy_amount: product.subsidy_amount,
        panel_type: product.panel_type,
        image_url: product.image_url,
        category: product.category,
        category_id: product.category_id,
        features: product.features || []
      })
      .select()
      .single();
      
    if (productError) {
      console.error('Error creating product:', productError);
      return { data: null, error: productError };
    }
    
    // 2. Prepare variants with the product_id
    const variantsWithProductId = variants.map((variant, index) => ({
      ...variant,
      product_id: newProduct.id,
      // Only one variant can be the default
      is_default: index === 0 // Set first variant as default initially
    }));
    
    // 3. Create all variants
    const { data: createdVariants, error: variantsError } = await supabase
      .from('product_variants')
      .insert(variantsWithProductId)
      .select();
      
    if (variantsError) {
      console.error('Error creating variants:', variantsError);
      // In a real transaction, we would rollback here. Since Supabase doesn't support
      // transactions yet, we'll have to manually delete the product
      await supabase.from('product_skus').delete().eq('id', newProduct.id);
      return { data: null, error: variantsError };
    }
    
    // 4. Update product with default_variant_id
    const defaultVariant = createdVariants.find(v => v.is_default);
    if (defaultVariant) {
      const { error: updateError } = await supabase
        .from('product_skus')
        .update({ default_variant_id: defaultVariant.id })
        .eq('id', newProduct.id);
        
      if (updateError) {
        console.error('Error updating product with default variant:', updateError);
        // We won't rollback here since we have created valid product and variants
      }
    }
    
    // 5. Return the product with its variants
    return { 
      data: { 
        ...newProduct, 
        variants: createdVariants,
        default_variant_id: defaultVariant?.id
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Exception in createProductWithVariants:', error);
    return { data: null, error };
  }
}
```

#### Task 5B.3: Set Initial Default Variant
```jsx
// In ProductSKUs.tsx - Update the handleAddProduct function
const handleAddProduct = async () => {
  if (validateProductForm()) {
    setIsSubmitting(true);
    
    try {
      // Mark the selected variant as default and others as non-default
      const variantsToCreate = initialVariants.map((variant, index) => ({
        ...variant,
        is_default: index === defaultVariantIndex
      }));
      
      // Create product with variants
      const { data, error } = await createProductWithVariants(productData, variantsToCreate);
      
      if (error) {
        setSubmitError(`Failed to create product: ${error.message}`);
      } else {
        closeModal();
        fetchProducts(); // Refresh the products list
        setSuccessMessage('Product created successfully!');
      }
    } catch (error) {
      console.error('Error in handleAddProduct:', error);
      setSubmitError('An unexpected error occurred while creating the product');
    } finally {
      setIsSubmitting(false);
    }
  }
};
```

## Implementation Steps

1. First, add the initial variants section to the product creation form
2. Set up state management for handling multiple initial variants
3. Add the capacity presets functionality for quick variant generation
4. Update the product form validation to check variant validity
5. Implement the createProductWithVariants function in productUtils.ts
6. Connect the new variant UI to the product creation handler

## Dependencies

- Existing product creation form in ProductSKUs.tsx
- React useState and other hooks for state management
- Supabase client for database operations
- productUtils.ts functions from previous phases

## Expected UI Result

After implementing Phase 5, the product creation workflow will now support:

1. Creating a product with one or more variants at the same time
2. Setting initial variant properties (name, capacity, price, etc.)
3. Designating one variant as the default
4. Using capacity presets to quickly generate common variant configurations
5. Validation to ensure each product has at least one valid variant

This enhances the product management experience by allowing administrators to set up complete products with variants in a single operation, rather than having to create variants separately after creating the base product.
