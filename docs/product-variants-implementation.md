# Product Variants Implementation Guide

## Overview

This document outlines the implementation plan for adding product variant management to the Product SKUs admin page. It follows the database schema where products are stored in the `product_skus` table and their variants in the `product_variants` table.

## Database Schema

### Tables Structure

#### `product_categories` Table
- Primary table for product categories
- Contains fields:
  - `id` (primary key)
  - `name`
  - `description` (optional)
  - `icon_name` (for UI representation)

#### `product_skus` Table
- Primary table for product information
- Has foreign key `category_id` referencing `product_categories(id)`
- Each product has exactly one category
- Contains fields:
  - `id` (primary key)
  - `name`
  - `sku` (unique identifier)
  - `description`
  - `price`
  - `capacity_kw`
  - `category_id` (foreign key)
  - `category` (for backward compatibility)
  - `default_variant_id` (references the default variant)
  - Other product attributes (installation_time, area_required, etc.)

#### `product_variants` Table
- Contains specific variants of products
- Foreign key `product_id` references `product_skus(id)`
- Contains fields:
  - `id` (primary key)
  - `product_id` (foreign key)
  - `variant_name`
  - `variant_sku`
  - `capacity_kw`
  - `price`
  - `subsidy_percentage`
  - `area_required`
  - `monthly_savings`
  - `installation_days`
  - `is_default` (boolean flag for default variant)
  - Other variant-specific attributes

### Relationships

1. **Category to Product**: One-to-Many
   - One category can have many products
   - Each product belongs to exactly one category

2. **Product to Variant**: One-to-Many
   - One product can have multiple variants
   - Each variant belongs to exactly one product
   - Each product must have exactly one default variant (enforced by is_default flag)

## Implementation Plan

### Step 1: Update Interfaces and Types

1. **Update ProductSKU Interface**:
   ```typescript
   interface ProductSKU {
     id: string;
     name: string;
     sku: string;
     category: string;
     category_id: string;
     price: number;
     capacity_kw?: number;
     description: string;
     // ...other product fields
     default_variant_id?: string;
     variants?: ProductVariant[];
   }
   ```

2. **Create ProductVariant Interface**:
   ```typescript
   interface ProductVariant {
     id: string;
     product_id: string;
     variant_name?: string;
     variant_sku?: string;
     capacity_kw: number;
     price: number;
     subsidy_percentage: number;
     area_required: number;
     monthly_savings: number;
     installation_days: string;
     is_default: boolean;
     // ...other variant fields
   }
   ```

### Step 2: Backend Interaction Functions

1. **Product Fetching with Variants**:
   ```typescript
   async function getProductsWithVariants() {
     const { data, error } = await supabase
       .from('product_skus')
       .select(`
         *,
         product_categories(id, name, icon_name),
         variants:product_variants(*)
       `)
       .order('name');
     
     // Error handling and processing
     // ...
   }
   ```

2. **Variant Management Functions**:
   ```typescript
   // Create a new variant
   async function createVariant(variant: ProductVariant) {
     // Implementation
   }
   
   // Update an existing variant
   async function updateVariant(id: string, variant: Partial<ProductVariant>) {
     // Implementation
   }
   
   // Delete a variant
   async function deleteVariant(id: string) {
     // Implementation
   }
   
   // Set a variant as default
   async function setDefaultVariant(productId: string, variantId: string) {
     // Implementation
   }
   ```

### Step 3: Admin UI - Product List View

1. **Enhance Products Table**:
   - Add variant count column
   - Add indicator for products with variants
   - Show default variant's capacity in the table

2. **Improve Product Filtering**:
   - Add filter for products with/without variants
   - Filter by capacity range

### Step 4: Product Edit Modal Updates

1. **Basic Product Information Tab**:
   - Keep existing product fields
   - Add field for default variant selection

2. **Create Variants Tab**:
   - Add tabbed interface with "Variants" tab
   - Display list of variants for current product
   - Show "No variants" message for products without variants

### Step 5: Variant Management UI

1. **Variant List Component**:
   ```jsx
   function VariantsList({ product, onEdit, onDelete, onSetDefault }) {
     // Implementation of variant listing
     return (
       <div className="variants-list">
         <h3>Product Variants</h3>
         <table>
           {/* Table headers */}
           <tbody>
             {product.variants?.map(variant => (
               <tr key={variant.id}>
                 {/* Variant data fields */}
                 {/* Action buttons */}
               </tr>
             ))}
           </tbody>
         </table>
         <button onClick={() => onAdd()}>Add New Variant</button>
       </div>
     );
   }
   ```

2. **Variant Form Component**:
   ```jsx
   function VariantForm({ variant, product, onSave, onCancel }) {
     // Form state and handlers
     // ...
     
     return (
       <form onSubmit={handleSubmit}>
         {/* Form fields */}
         <div className="form-actions">
           <button type="submit">Save Variant</button>
           <button type="button" onClick={onCancel}>Cancel</button>
         </div>
       </form>
     );
   }
   ```

### Step 6: Variant CRUD Operations

1. **Create/Add Variant**:
   - Function to add new variant to a product
   - Handle setting default if it's the first variant
   - Update parent product's default_variant_id if needed

2. **Update Variant**:
   - Function to update variant properties
   - Special handling for is_default changes

3. **Delete Variant**:
   - Function to remove a variant
   - Handle case where default variant is deleted (assign new default)
   - Prevent deletion if it's the only variant

4. **Set Default Variant**:
   - Function to change which variant is the default
   - Update product's default_variant_id
   - Update is_default flags in variants

### Step 7: Product Creation with Initial Variants

1. **Enhanced Product Creation Form**:
   - Add section to create initial variants during product creation
   - Include capacity presets
   - Specify which variant is default

2. **Product Creation Handler**:
   - Create product record first
   - Create variants with product_id reference
   - Update product with default_variant_id

### Step 8: Testing and Validation

1. **Variant Management Workflows**:
   - Create product with variants
   - Add/edit/delete variants
   - Change default variant

2. **Database Integrity Checks**:
   - Verify each product has exactly one default variant
   - Check referential integrity

## Business Rules

1. Every product must have at least one variant
2. Every product must have exactly one default variant
3. When creating a new product, create at least one initial variant
4. When deleting a default variant, another variant must be set as default
5. When deleting the last variant of a product, show a warning as this is equivalent to deleting the product
6. Variant prices may differ from the base product price

## UI/UX Guidelines

1. **Default Variant Indication**:
   - Use a star icon (★) to mark the default variant
   - Highlight the default variant row in the variants table

2. **Variant Management Actions**:
   - Place clear "Add Variant", "Edit", and "Delete" buttons
   - Use confirmation modals for destructive actions
   - Provide feedback for successful operations

3. **Form Layout**:
   - Group variant-specific fields logically
   - Use consistent validation patterns
   - Pre-populate fields with sensible defaults

4. **Navigation**:
   - Use tabs to separate product details from variant management
   - Provide breadcrumb navigation for editing nested variants

## Next Steps

1. Update the ProductSKUs.tsx component to include the variant management UI
2. Create/update utility functions in productUtils.ts for variant operations
3. Add backend support for variant management in the Supabase database
4. Test the entire workflow from product creation to variant management
