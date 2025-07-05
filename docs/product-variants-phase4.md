# Product Variant Management Implementation Guide - Phase 4

## Phase 4: Variant Management Core Functions

This document covers the fourth phase of implementing product variant management for the Type 3 Energy Admin interface, focusing on the core CRUD operations for variants.

### Chunk 4A: Create Variant

#### Task 4A.1: Add "Add Variant" Button and Handler
```jsx
// In ProductSKUs.tsx - Add handler functions
const handleAddVariant = () => {
  const newVariant = {
    product_id: selectedProduct.id,
    variant_name: `${selectedProduct.name} Variant`,
    variant_sku: `${selectedProduct.sku}-V${variants.length + 1}`,
    capacity_kw: selectedProduct.capacity_kw || 1,
    price: selectedProduct.price || 0,
    subsidy_percentage: 0,
    area_required: selectedProduct.area_required || 0,
    monthly_savings: selectedProduct.monthly_savings || 0,
    installation_days: selectedProduct.installation_time || '7-10 days',
    is_default: variants.length === 0, // Make default if it's the first variant
    panel_type: selectedProduct.panel_type || '',
    features: selectedProduct.features || []
  };
  
  setActiveVariant(newVariant);
  setIsAddingVariant(true);
};
```

#### Task 4A.2: Create Variant Form Component
```jsx
// In ProductSKUs.tsx or as a separate component
const VariantForm = ({ variant, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    variant_name: variant.variant_name || '',
    variant_sku: variant.variant_sku || '',
    capacity_kw: variant.capacity_kw || 0,
    price: variant.price || 0,
    subsidy_percentage: variant.subsidy_percentage || 0,
    area_required: variant.area_required || 0,
    monthly_savings: variant.monthly_savings || 0,
    installation_days: variant.installation_days || '',
    is_default: variant.is_default || false,
    panel_type: variant.panel_type || '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setFormData({
      ...formData,
      [name]: numericValue
    });
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.variant_name.trim()) {
      errors.variant_name = 'Variant name is required';
    }
    
    if (!formData.variant_sku.trim()) {
      errors.variant_sku = 'Variant SKU is required';
    }
    
    if (formData.capacity_kw <= 0) {
      errors.capacity_kw = 'Capacity must be greater than 0';
    }
    
    if (formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...variant,
        ...formData
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="variant_name" className="block text-sm font-medium text-gray-700">Variant Name</label>
          <input
            type="text"
            name="variant_name"
            id="variant_name"
            value={formData.variant_name}
            onChange={handleChange}
            className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.variant_name ? 'border-red-500' : ''}`}
          />
          {formErrors.variant_name && (
            <p className="mt-1 text-sm text-red-500">{formErrors.variant_name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="variant_sku" className="block text-sm font-medium text-gray-700">Variant SKU</label>
          <input
            type="text"
            name="variant_sku"
            id="variant_sku"
            value={formData.variant_sku}
            onChange={handleChange}
            className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.variant_sku ? 'border-red-500' : ''}`}
          />
          {formErrors.variant_sku && (
            <p className="mt-1 text-sm text-red-500">{formErrors.variant_sku}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="capacity_kw" className="block text-sm font-medium text-gray-700">Capacity (kW)</label>
          <input
            type="number"
            step="0.1"
            name="capacity_kw"
            id="capacity_kw"
            value={formData.capacity_kw}
            onChange={handleNumericChange}
            className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.capacity_kw ? 'border-red-500' : ''}`}
          />
          {formErrors.capacity_kw && (
            <p className="mt-1 text-sm text-red-500">{formErrors.capacity_kw}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleNumericChange}
            className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.price ? 'border-red-500' : ''}`}
          />
          {formErrors.price && (
            <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
          )}
        </div>
        
        {/* Add more form fields as needed */}
        
        <div className="col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_default"
              id="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
              Set as default variant
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Each product must have exactly one default variant. Setting this as default will unset any existing default.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Variant'}
        </button>
      </div>
    </form>
  );
};
```

#### Task 4A.3: Implement createVariant Function
```typescript
// In productUtils.ts
export async function createVariant(variant: ProductVariant): Promise<{ data: ProductVariant | null, error: any }> {
  try {
    // If this is set as default, first unset any existing default variants
    if (variant.is_default) {
      await supabase
        .from('product_variants')
        .update({ is_default: false })
        .eq('product_id', variant.product_id)
        .eq('is_default', true);
    }
    
    // Create the new variant
    const { data, error } = await supabase
      .from('product_variants')
      .insert(variant)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating variant:', error);
      return { data: null, error };
    }
    
    // If this is the default variant, update the product's default_variant_id
    if (variant.is_default && data) {
      await supabase
        .from('product_skus')
        .update({ default_variant_id: data.id })
        .eq('id', variant.product_id);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception in createVariant:', error);
    return { data: null, error };
  }
}
```

### Chunk 4B: Update Variant

#### Task 4B.1: Create Edit Variant Modal
```jsx
// In ProductSKUs.tsx
const renderVariantModal = () => {
  if (!activeVariant) return null;
  
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isAddingVariant ? 'Add New Variant' : 'Edit Variant'}
                </h3>
                <div className="mt-4">
                  <VariantForm
                    variant={activeVariant}
                    onSave={handleSaveVariant}
                    onCancel={handleCancelVariantEdit}
                    isSaving={isVariantSaving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### Task 4B.2: Pre-populate Form with Variant Data
```jsx
// In ProductSKUs.tsx - Add handler for edit button
const handleEditVariant = (variant) => {
  setActiveVariant({
    ...variant
  });
  setIsEditingVariant(true);
  setIsAddingVariant(false);
};

// Cancel handler
const handleCancelVariantEdit = () => {
  setActiveVariant(null);
  setIsEditingVariant(false);
  setIsAddingVariant(false);
};
```

#### Task 4B.3: Implement updateVariant Function
```typescript
// In productUtils.ts
export async function updateVariant(id: string, updates: Partial<ProductVariant>): Promise<{ data: ProductVariant | null, error: any }> {
  try {
    const { is_default, product_id } = updates;
    
    // If setting as default, first unset any existing default variants
    if (is_default) {
      await supabase
        .from('product_variants')
        .update({ is_default: false })
        .eq('product_id', product_id)
        .eq('is_default', true);
    }
    
    // Update the variant
    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating variant:', error);
      return { data: null, error };
    }
    
    // If this is now the default variant, update the product's default_variant_id
    if (is_default && data) {
      await supabase
        .from('product_skus')
        .update({ default_variant_id: data.id })
        .eq('id', product_id);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception in updateVariant:', error);
    return { data: null, error };
  }
}
```

### Chunk 4C: Delete Variant

#### Task 4C.1: Create Delete Confirmation UI
```jsx
// In ProductSKUs.tsx
const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null);

const handleDeleteVariant = (variant) => {
  setVariantToDelete(variant);
  setIsConfirmingDelete(true);
};

const confirmDeleteVariant = async () => {
  if (!variantToDelete) return;
  
  setIsVariantDeleting(true);
  try {
    const { error } = await deleteVariant(variantToDelete.id, variantToDelete.product_id);
    
    if (error) {
      setVariantActionError(`Failed to delete variant: ${error.message}`);
    } else {
      // Refresh variants list
      const updatedVariants = await getProductVariants(selectedProduct.id);
      setVariants(updatedVariants);
    }
  } catch (error) {
    console.error('Error deleting variant:', error);
    setVariantActionError('An unexpected error occurred while deleting the variant');
  } finally {
    setIsVariantDeleting(false);
    setIsConfirmingDelete(false);
    setVariantToDelete(null);
  }
};

const cancelDeleteVariant = () => {
  setIsConfirmingDelete(false);
  setVariantToDelete(null);
};

// Deletion confirmation modal
const renderDeleteConfirmation = () => {
  if (!isConfirmingDelete || !variantToDelete) return null;
  
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Variant
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the variant "{variantToDelete.variant_name || 'Unnamed'}"? 
                    {variantToDelete.is_default && ' This is currently set as the default variant.'}
                  </p>
                  {variants.length <= 1 && (
                    <p className="mt-2 text-sm text-red-500 font-medium">
                      Warning: This is the only variant for this product. Deleting it will leave the product without any variants.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={confirmDeleteVariant}
              disabled={isVariantDeleting}
            >
              {isVariantDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={cancelDeleteVariant}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### Task 4C.2: Implement deleteVariant Function
```typescript
// In productUtils.ts
export async function deleteVariant(id: string, productId: string): Promise<{ success: boolean, error: any }> {
  try {
    // First check if this is the default variant
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('is_default')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching variant for delete:', fetchError);
      return { success: false, error: fetchError };
    }
    
    // Get count of variants for this product
    const { count, error: countError } = await supabase
      .from('product_variants')
      .select('id', { count: 'exact' })
      .eq('product_id', productId);
      
    if (countError) {
      console.error('Error counting variants:', countError);
      return { success: false, error: countError };
    }
    
    // Delete the variant
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);
      
    if (deleteError) {
      console.error('Error deleting variant:', deleteError);
      return { success: false, error: deleteError };
    }
    
    // If this was the default variant and there are other variants, set a new default
    if (variant.is_default && count && count > 1) {
      // Get another variant to set as default
      const { data: newDefault, error: newDefaultError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId)
        .neq('id', id)
        .limit(1)
        .single();
        
      if (!newDefaultError && newDefault) {
        // Set as new default
        await supabase
          .from('product_variants')
          .update({ is_default: true })
          .eq('id', newDefault.id);
          
        // Update product's default_variant_id
        await supabase
          .from('product_skus')
          .update({ default_variant_id: newDefault.id })
          .eq('id', productId);
      }
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception in deleteVariant:', error);
    return { success: false, error };
  }
}
```

### Chunk 4D: Set Default Variant

#### Task 4D.1: Implement setDefaultVariant Function
```typescript
// In productUtils.ts
export async function setDefaultVariant(variantId: string, productId: string): Promise<{ success: boolean, error: any }> {
  try {
    // Start a transaction by:    
    // 1. Unset any existing default variants for this product
    const { error: unsetError } = await supabase
      .from('product_variants')
      .update({ is_default: false })
      .eq('product_id', productId);
      
    if (unsetError) {
      console.error('Error unsetting default variants:', unsetError);
      return { success: false, error: unsetError };
    }
    
    // 2. Set the new default variant
    const { error: setError } = await supabase
      .from('product_variants')
      .update({ is_default: true })
      .eq('id', variantId);
      
    if (setError) {
      console.error('Error setting default variant:', setError);
      return { success: false, error: setError };
    }
    
    // 3. Update the product's default_variant_id
    const { error: updateProductError } = await supabase
      .from('product_skus')
      .update({ default_variant_id: variantId })
      .eq('id', productId);
      
    if (updateProductError) {
      console.error('Error updating product default variant:', updateProductError);
      return { success: false, error: updateProductError };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception in setDefaultVariant:', error);
    return { success: false, error };
  }
}
```

#### Task 4D.2: Add Handler for Set Default Button
```jsx
// In ProductSKUs.tsx
const handleSetDefaultVariant = async (variant) => {
  setIsVariantSaving(true);
  try {
    const { success, error } = await setDefaultVariant(variant.id, variant.product_id);
    
    if (!success) {
      setVariantActionError(`Failed to set default variant: ${error.message}`);
    } else {
      // Refresh variants list
      const updatedVariants = await getProductVariants(selectedProduct.id);
      setVariants(updatedVariants);
      
      // Also refresh the selected product to get updated default_variant_id
      const { data: updatedProduct } = await supabase
        .from('product_skus')
        .select('*')
        .eq('id', selectedProduct.id)
        .single();
        
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      }
    }
  } catch (error) {
    console.error('Error setting default variant:', error);
    setVariantActionError('An unexpected error occurred while setting the default variant');
  } finally {
    setIsVariantSaving(false);
  }
};
```

#### Task 4D.3: Ensure UI Refreshes to Show New Default
```jsx
// In the VariantList component, add a visual indicator for the default variant
<tr key={variant.id} className={variant.is_default ? 'bg-green-50' : ''}>
  {/* Variant properties */}
  {/* ... */}
  <td className="px-6 py-4 whitespace-nowrap">
    {variant.is_default ? (
      <div className="flex items-center">
        <span className="text-yellow-500 mr-1">u2605</span>
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Default
        </span>
      </div>
    ) : (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
        Variant
      </span>
    )}
  </td>
  {/* ... */}
</tr>
```

## Implementation Steps

1. First, implement the core variant management functions in productUtils.ts
2. Create the VariantForm component for adding and editing variants
3. Implement the handler functions for variant CRUD operations
4. Add the variant action modals (edit form, delete confirmation)
5. Connect the UI components to the handler functions

## Dependencies

- Existing ProductSKUs component and modal structure
- React useState and other hooks for state management
- Supabase client for database operations
- Tailwind CSS for styling (maintaining Type 3 Energy's UI consistency)

## Expected UI Result

After implementing Phase 4, the product variant management will now have full CRUD functionality:

1. Users can add new variants to a product
2. Users can edit existing variants
3. Users can delete variants with proper validation
4. Users can set a variant as the default for a product
5. The UI will reflect all these changes in real-time

This phase completes the core functionality needed for variant management. The next phases will focus on enhancing the product creation workflow and adding advanced features.
