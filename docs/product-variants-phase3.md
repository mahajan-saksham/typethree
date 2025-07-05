# Product Variant Management Implementation Guide - Phase 3

## Phase 3: Variant Management UI - Basic

This document covers the third phase of implementing product variant management for the Type 3 Energy Admin interface, focusing on creating the basic variant management UI components.

### Chunk 3A: Tabbed Interface

#### Task 3A.1: Add Tabs to Product Edit Modal
```jsx
// In ProductSKUs.tsx edit modal
<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
  {/* Tab navigation */}
  <div className="mb-4 border-b border-gray-200">
    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
      <li className="mr-2" role="presentation">
        <button
          className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'product' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
          onClick={() => setActiveTab('product')}
          role="tab"
          aria-selected={activeTab === 'product'}
        >
          Product Info
        </button>
      </li>
      <li className="mr-2" role="presentation">
        <button
          className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'variants' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
          onClick={() => setActiveTab('variants')}
          role="tab"
          aria-selected={activeTab === 'variants'}
        >
          Variants
        </button>
      </li>
    </ul>
  </div>
  
  {/* Tab content */}
  <div className="tab-content">
    {activeTab === 'product' ? (
      <div role="tabpanel">
        {/* Existing product form */}
        {/* ... */}
      </div>
    ) : (
      <div role="tabpanel">
        {/* Variants tab content - will be implemented in next chunks */}
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
          <p className="mt-2 text-sm text-gray-500">
            Manage different variants of this product.
          </p>
        </div>
      </div>
    )}
  </div>
</div>
```

#### Task 3A.2: Create Empty Variants Tab
```jsx
// In ProductSKUs.tsx - Empty/placeholder variant tab component
const VariantsTab = ({ product, variants, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!variants || variants.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No variants</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new variant for this product.
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => onAddVariant()}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Variant
          </button>
        </div>
      </div>
    );
  }
  
  // Will be replaced with actual variant list in next chunk
  return <div>Variant list will be shown here</div>;
};
```

#### Task 3A.3: Set Up Tab Switching Logic
```jsx
// In ProductSKUs.tsx

// Add state for managing tabs
const [activeTab, setActiveTab] = useState('product');

// Function to load variants when switching to variants tab
const handleTabChange = async (tabName) => {
  setActiveTab(tabName);
  
  if (tabName === 'variants' && selectedProduct) {
    setIsLoadingVariants(true);
    try {
      const productVariants = await getProductVariants(selectedProduct.id);
      setVariants(productVariants);
    } catch (error) {
      console.error('Error loading variants:', error);
      setVariantActionError('Failed to load variants');
    } finally {
      setIsLoadingVariants(false);
    }
  }
};

// Reset tab when closing modal
const closeModal = () => {
  setSelectedProduct(null);
  setActiveTab('product');
  resetVariantStates();
  // ... other reset actions
};
```

### Chunk 3B: Variant List

#### Task 3B.1: Create Variant Listing Component
```jsx
// In ProductSKUs.tsx
const VariantList = ({ variants, onEdit, onDelete, onSetDefault }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capacity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {variants.map((variant) => (
            <tr key={variant.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {variant.variant_name || 'Unnamed'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {variant.capacity_kw} kW
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹{variant.price.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {variant.is_default ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Default
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Variant
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {/* Action buttons will be added in the next chunk */}
                <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

#### Task 3B.2: Add Key Variant Properties
```jsx
// Update the VariantsTab component to use the VariantList
const VariantsTab = ({ product, variants, isLoading, onAddVariant, onEditVariant, onDeleteVariant, onSetDefaultVariant }) => {
  // Loading and empty states as before...
  
  // When we have variants, show the list
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onAddVariant}
        >
          Add Variant
        </button>
      </div>
      
      <VariantList 
        variants={variants} 
        onEdit={onEditVariant}
        onDelete={onDeleteVariant}
        onSetDefault={onSetDefaultVariant}
      />
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>Note:</strong> Each product must have at least one variant, and exactly one variant must be set as the default.
        </p>
      </div>
    </div>
  );
};
```

#### Task 3B.3: Add Default Variant Indicator
```jsx
// In the VariantList component
<td className="px-6 py-4 whitespace-nowrap">
  {variant.is_default ? (
    <div className="flex items-center">
      <span className="mr-2">★</span>
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
```

### Chunk 3C: Variant Action Buttons

#### Task 3C.1: Add Edit Variant Button
```jsx
// In the VariantList component action column
<button 
  className="text-indigo-600 hover:text-indigo-900 mr-2"
  onClick={() => onEdit(variant)}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
</button>
```

#### Task 3C.2: Add Delete Variant Button
```jsx
// In the VariantList component action column
<button 
  className="text-red-600 hover:text-red-900 mr-2"
  onClick={() => onDelete(variant)}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
</button>
```

#### Task 3C.3: Add Set as Default Button
```jsx
// In the VariantList component action column
{!variant.is_default && (
  <button 
    className="text-green-600 hover:text-green-900"
    onClick={() => onSetDefault(variant)}
    title="Set as Default Variant"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  </button>
)}
```

## Implementation Steps

1. First, add the tabbed interface to the product edit modal in ProductSKUs.tsx
2. Create the VariantsTab component with loading and empty states
3. Implement the VariantList component showing all variant properties
4. Add the action buttons for edit, delete, and set-default actions
5. Set up the tab switching logic to load variants when needed

## Dependencies

- Existing product edit modal in ProductSKUs.tsx
- React useState for state management
- The variant fetching function from Phase 1
- Tailwind CSS for styling (maintaining Type 3 Energy's UI consistency)

## Expected UI Result

After implementing Phase 3, the product edit modal should now have:

1. A tabbed interface with "Product Info" and "Variants" tabs
2. A variants tab that shows loading state while fetching variants
3. An empty state when a product has no variants
4. A variant list showing key properties like name, capacity, price, and default status
5. Action buttons for each variant (edit, delete, set as default)

This provides the foundation for variant management that will be connected to actual CRUD operations in the next phase.
