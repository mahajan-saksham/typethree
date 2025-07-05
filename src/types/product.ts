/**
 * Type definitions for the product database schema
 * This file contains TypeScript interfaces for product-related data structures
 */

/**
 * Product Category
 */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Product Variant
 */
export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  capacity_kw: number;
  price: number;
  subsidy_percentage: number;
  subsidized_price: number; // Generated column: price * (1 - subsidy_percentage / 100)
  area_required_sqft?: number;
  monthly_savings?: number;
  installation_days?: string;
  is_default: boolean;
  is_active: boolean;
  inventory_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Product Image
 */
export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Product (SKU)
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  description?: string;
  short_description?: string;
  features?: {
    highlights?: string[];
    [key: string]: any;
  };
  specifications?: {
    [key: string]: any;
  };
  use_cases: string[];
  has_subsidy: boolean;
  has_variants: boolean;
  variant_name: string;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  
  // Relations (populated by Supabase queries)
  category?: ProductCategory;
  variants?: ProductVariant[];
  images?: ProductImage[];
  default_variant?: ProductVariant;
}

/**
 * Product with Default Variant
 * Used for product listings where we display the default variant's details
 */
export interface ProductWithDefaultVariant extends Product {
  default_variant: ProductVariant;
  primary_image?: ProductImage;
}

/**
 * Product Detail
 * Complete product information with all variants and images
 */
export interface ProductDetail extends Product {
  variants: ProductVariant[];
  images: ProductImage[];
  category: ProductCategory;
}
