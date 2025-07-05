# Product Detail Page Implementation Specification

## Overview
Converting the product details popup modal into a standalone page to improve SEO, user experience, and maintainability.

## Current Architecture

Currently in the Type 3 Solar website:

1. Products are displayed in a grid on the `/products` page
2. Clicking a product opens a modal popup with details
3. The modal has limitations for SEO, navigation, and content organization

## Technical Architecture Changes

### 1. New Component Structure

```
src/
├── pages/
|   ├── ProductDetail.tsx (NEW)
|   ├── Products.tsx (MODIFY)
|   └── Home.tsx (MODIFY)
└── App.tsx (MODIFY)
```

### 2. Data Flow

```
User clicks product card 
  → React Router navigates to /products/:productId 
    → ProductDetail component loads 
      → useParams hook extracts productId 
        → Fetch product data from Supabase 
          → Render full product details
```

### 3. Routing Implementation

In `App.tsx`:
```tsx
<Routes>
  {/* Existing routes */}
  <Route path="products" element={<Products />} />
  <Route path="products/:productId" element={<ProductDetail />} /> {/* NEW */}
</Routes>
```

### 4. Component Interface 

```tsx
interface Product {
  id: string;
  name: string;
  capacity_kw: number;
  generation: string;
  area_required: number;
  monthly_savings: number;
  price: number;
  subsidy_amount?: number;
  sku: string;
  panel_type: string;
  installation_time: string;
  power: number;
  image_url?: string;
  description?: string;
}
```

## UI Design Specifications

### Layout
- Full-width responsive container with max-width constraint
- Two-column grid on desktop (image left, details right)
- Single column stacked layout on mobile
- Consistent padding and spacing with existing pages

### Visual Elements

1. **Header Section**
   - Breadcrumb navigation
   - Large product title in primary color
   - Concise product description

2. **Image Section**
   - Large feature image with fallback
   - Optional image gallery for multiple product views
   - Gradient overlay consistent with brand styling

3. **Product Specifications**
   - Grid layout for specifications
   - Consistent typography with hierarchy
   - Primary color accents for section headers

4. **Pricing Section**
   - Original price (strikethrough) with subsidy percentage
   - Prominent discounted price with currency formatting
   - Monthly EMI calculation

5. **Call-to-Action**
   - Primary button with consistent styling
   - Left-aligned text with right-aligned icon
   - Uses the established button pattern from the rest of the site:
     - Font: Medium weight with no text transform
     - Letter spacing: -0.02em
     - Icon placement: Right-aligned
     - Hover/active states consistent with other buttons

## SEO Considerations

1. **Meta Tags**
   ```tsx
   <title>{product.name} | Type 3 Solar</title>
   <meta name="description" content={`${product.capacity_kw}kW ${product.name} - ${product.description?.substring(0, 150) || 'High-efficiency solar system'}`} />
   ```

2. **URL Structure**
   - Clean, semantic URLs: `/products/[product-id]`
   - Consider adding slug support for more readable URLs

3. **Structured Data**
   - Implement JSON-LD for product schema
   - Include price, availability, and product specifications

## Performance Considerations

1. **Data Fetching**
   - Implement loading state during data fetch
   - Add error boundary for failed data fetching
   - Consider prefetching popular products from listing page

2. **Image Optimization**
   - Responsive images with appropriate srcset
   - Lazy loading for secondary images
   - Placeholder during image loading

## Implementation Steps

1. Create `ProductDetail.tsx` component
   - Implement responsive layout
   - Add data fetching logic
   - Style according to design system
   
2. Update `App.tsx` with new route

3. Modify `Products.tsx`
   - Remove modal implementation
   - Update product cards to link to detail page

4. Update `Home.tsx`
   - Update product links in "Perfect Match" section
   - Update links in "Suggested Products" section

5. Testing
   - Verify all links work correctly
   - Test responsive behavior
   - Validate SEO implementation

## Future Enhancements

1. Add product comparison feature
2. Implement related products section
3. Add customer reviews/ratings
4. Create shareable product links for social media
