# Product Database Schema Implementation

This document outlines the database schema implementation for the Type 3 Solar Platform product system, including product variants, categories, specifications, and images.

## Schema Overview

The product database schema follows a structured approach with the following main tables:

1. **product_categories**: Categories for organizing products
2. **product_skus**: Main product information
3. **product_variants**: Different capacity options for each product with variant-specific attributes
4. **product_images**: Product images with primary image flag

## Database Structure

### product_categories

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Category name (e.g., "Residential") |
| slug | TEXT | URL-friendly identifier |
| description | TEXT | Category description |
| icon_name | TEXT | Icon identifier for UI |
| is_active | BOOLEAN | Whether the category is active |
| display_order | INTEGER | Order for display in UI |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### product_skus

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| slug | TEXT | URL-friendly identifier |
| sku | TEXT | Stock keeping unit identifier |
| category_id | UUID | Foreign key to product_categories |
| description | TEXT | Full product description |
| short_description | TEXT | Short summary for listings |
| features | JSONB | Product features and highlights |
| specifications | JSONB | Technical specifications |
| use_cases | TEXT[] | Array of use cases (Residential, Commercial, Industrial) |
| has_subsidy | BOOLEAN | Whether product qualifies for subsidy |
| has_variants | BOOLEAN | Whether product has multiple variants |
| variant_name | TEXT | Name of the variant type (default: "Capacity") |
| is_active | BOOLEAN | Whether the product is active |
| seo_title | TEXT | Custom SEO title |
| seo_description | TEXT | Custom SEO description |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### product_variants

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | Foreign key to product_skus |
| name | TEXT | Variant name (e.g., "1kW") |
| capacity_kw | NUMERIC | System capacity in kilowatts |
| price | NUMERIC | Full price before subsidy |
| subsidy_percentage | NUMERIC | Subsidy percentage (0-100) |
| subsidized_price | NUMERIC | Calculated price after subsidy |
| area_required_sqft | NUMERIC | Area required in square feet |
| monthly_savings | NUMERIC | Estimated monthly savings |
| installation_days | TEXT | Estimated installation time |
| is_default | BOOLEAN | Whether this is the default variant |
| is_active | BOOLEAN | Whether the variant is active |
| inventory_count | INTEGER | Inventory count for this variant |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### product_images

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | Foreign key to product_skus |
| url | TEXT | Image URL |
| alt_text | TEXT | Alt text for accessibility |
| is_primary | BOOLEAN | Whether this is the primary product image |
| display_order | INTEGER | Order for display in UI |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Key Features

### 1. Product Variants

Each product can have multiple variants with different capacities (e.g., 1kW, 2kW, 3kW, 5kW). Key aspects:

- One product can have multiple capacity variants
- Each variant has its own price, subsidy, area requirements, etc.
- One variant is designated as the default via the `is_default` flag
- Database trigger ensures only one default variant per product

### 2. Default Variant Management

A database trigger ensures that exactly one variant per product is marked as the default. This happens when:

- A variant's `is_default` flag is set to true (all others are set to false)
- The current default variant is deleted (another becomes the default)
- A variant's `is_default` flag is set to false (another becomes the default)

### 3. Calculated Fields

The schema includes calculated fields to improve performance and consistency:

- `subsidized_price`: Automatically calculated as `price * (1 - subsidy_percentage / 100)`

### 4. Row-Level Security (RLS)

Row-Level Security policies are implemented to ensure proper data access:

- Public users can only see active products, variants, and categories
- Admin users have full access to all records
- Variants for inactive products are not accessible to public users

## Database Queries

### Getting Products for Listing

```sql
SELECT 
  p.*,
  c.*,
  v.*,
  i.*
FROM product_skus p
JOIN product_categories c ON p.category_id = c.id
JOIN product_variants v ON v.product_id = p.id AND v.is_default = true
LEFT JOIN product_images i ON i.product_id = p.id AND i.is_primary = true
WHERE p.is_active = true AND c.is_active = true AND v.is_active = true
ORDER BY p.name;
```

### Getting Product Details

```sql
SELECT 
  p.*,
  c.*,
  (
    SELECT json_agg(v.*)
    FROM product_variants v
    WHERE v.product_id = p.id AND v.is_active = true
    ORDER BY v.capacity_kw
  ) as variants,
  (
    SELECT json_agg(i.*)
    FROM product_images i
    WHERE i.product_id = p.id
    ORDER BY i.display_order
  ) as images
FROM product_skus p
JOIN product_categories c ON p.category_id = c.id
WHERE p.slug = 'product-slug' AND p.is_active = true AND c.is_active = true;
```

## Migration Strategy

The implementation follows a careful migration strategy:

1. Create new tables with proper relationships
2. Add triggers and constraints for data integrity
3. Insert sample data for testing
4. Update frontend components to use the new schema
5. Implement fallbacks for backward compatibility

## TypeScript Integration

TypeScript interfaces are provided in `src/types/product.ts` to ensure type safety when working with the database. Key interfaces include:

- `Product`: Main product information
- `ProductVariant`: Variant-specific data
- `ProductCategory`: Category information
- `ProductImage`: Image data
- `ProductWithDefaultVariant`: Product with embedded default variant (for listings)
- `ProductDetail`: Complete product with all variants and images (for detail pages)

## Utility Functions

Utility functions in `src/utils/productDatabase.ts` provide a clean API for working with the database:

- `getProductsWithDefaultVariants()`: Gets products for listings
- `getProductBySlug()`: Gets complete product details
- `getProductVariants()`: Gets variants for a product
- `upsertProduct()`: Creates or updates a product
- `upsertProductVariant()`: Creates or updates a variant
- `calculateProductROI()`: Calculates ROI metrics for a variant

## Additional Notes

- **SEO Optimization**: The schema includes fields for custom SEO titles and descriptions
- **Use Case Filtering**: The `use_cases` array allows filtering products by their intended application
- **Image Management**: Multiple images per product with primary designation and display order
- **Performance**: Indices are created on frequently queried fields for optimal performance
