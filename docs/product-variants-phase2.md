# Product Variant Management Implementation Guide - Phase 2

## Phase 2: Product Listing Enhancements

This document covers the second phase of implementing product variant management for the Type 3 Energy Admin interface, focusing on enhancing the product listing table with variant information.

### Chunk 2A: Product Table Updates

#### Task 2A.1: Add Variant Count Column
```jsx
// In ProductSKUs.tsx table headers
<th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Variants
</th>

// In the table cell rendering
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {product.variants?.length || 0}
</td>
```

#### Task 2A.2: Add Default Variant Capacity Display
```jsx
// In ProductSKUs.tsx product table
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  <div className="flex items-center">
    <span className="mr-2">{product.capacity_kw} kW</span>
    {product.default_variant_id && (
      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
        Default
      </span>
    )}
  </div>
</td>
```

#### Task 2A.3: Add Visual Indicator for Products with Variants
```jsx
// In ProductSKUs.tsx product table row
<tr 
  key={product.id}
  className={`${product.variants?.length ? 'bg-blue-50' : ''} hover:bg-gray-100 cursor-pointer`}
  onClick={() => handleRowClick(product)}
>
  {/* Table cells */}
</tr>
```

### Chunk 2B: Product Filtering

#### Task 2B.1: Add Variant Filter Option
```jsx
// In ProductSKUs.tsx filter section
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Variant Status</label>
  <select
    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    value={variantFilter}
    onChange={(e) => setVariantFilter(e.target.value)}
  >
    <option value="all">All Products</option>
    <option value="with-variants">With Variants</option>
    <option value="without-variants">Without Variants</option>
  </select>
</div>
```

#### Task 2B.2: Add Capacity Range Filtering
```jsx
// In ProductSKUs.tsx filter section
<div className="grid grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-sm font-medium text-gray-700">Min Capacity</label>
    <input
      type="number"
      min="0"
      step="0.1"
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      value={minCapacity}
      onChange={(e) => setMinCapacity(parseFloat(e.target.value) || 0)}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700">Max Capacity</label>
    <input
      type="number"
      min="0"
      step="0.1"
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      value={maxCapacity}
      onChange={(e) => setMaxCapacity(parseFloat(e.target.value) || 0)}
    />
  </div>
</div>
```

#### Task 2B.3: Update Filter Logic
```jsx
// In ProductSKUs.tsx
const [variantFilter, setVariantFilter] = useState('all');
const [minCapacity, setMinCapacity] = useState(0);
const [maxCapacity, setMaxCapacity] = useState(0);

// Updated filter function
const filteredProducts = useMemo(() => {
  return products
    .filter((product) => {
      // Category filter
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }
      
      // Variant filter
      if (variantFilter === 'with-variants' && !product.variants?.length) {
        return false;
      }
      if (variantFilter === 'without-variants' && product.variants?.length) {
        return false;
      }
      
      // Capacity filter (if max capacity is set)
      if (maxCapacity > 0) {
        const productCapacity = product.capacity_kw || 0;
        if (productCapacity < minCapacity || productCapacity > maxCapacity) {
          return false;
        }
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortField === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      // Add more sort fields as needed
      return 0;
    });
}, [products, selectedCategory, variantFilter, minCapacity, maxCapacity, searchTerm, sortField, sortOrder]);
```

## Implementation Steps

1. First, update the product table component to add the variant count column
2. Modify the table row rendering to include the visual indicator for products with variants
3. Add the capacity display with default variant indicator
4. Add the new filter options to the filter section
5. Update the filter logic to handle variant and capacity filtering

## Dependencies

- Existing product table component in ProductSKUs.tsx
- React useState and useMemo for state management and memoization
- Tailwind CSS for styling (maintaining Type 3 Energy's UI consistency)
- The updated product interfaces from Phase 1

## Expected UI Result

After implementing Phase 2, the product listing table should now show:  

1. A count of variants for each product
2. Visual highlighting for products with variants
3. Display of the default variant capacity
4. New filter options for variant status and capacity range

This provides a more comprehensive overview of products and their variants directly in the main product list, allowing administrators to quickly identify which products have variants and filter by variant status.
