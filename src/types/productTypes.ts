// Product type definitions - simplified non-variant structure

/**
 * @deprecated - Kept for backward compatibility during migration
 * This interface will be removed in future versions
 */
export interface ProductVariant {
  id: string;
  product_id: string;
  capacity_kw: number;
  price: number;
  subsidy_percentage: number;
  area_required: number;
  monthly_savings: number;
  installation_days: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Main Product interface - consolidated from previous variant structure
 */
export interface Product {
  id: string;
  name: string;
  capacity_kw: number;
  generation?: string;
  area_required: number;
  monthly_savings: number;
  price: number;
  subsidy_percentage?: number;
  subsidy_amount?: number;
  sku: string;
  panel_type?: string;
  installation_time?: string;
  power?: number;
  image_url?: string;
  description?: string;
  category?: string;
  category_id?: string;
  features?: string[];
  created_at?: string;
  updated_at?: string;
}

// Standard pricing and calculation constants
export const PRICE_PER_KW = 70000; // 70,000 Rs per kW
export const DEFAULT_SUBSIDY_PERCENTAGE = 35; // 35% subsidy
export const INSTALLATION_DAYS = '4-5'; // 4-5 days installation time

// Utility functions for product calculations

/**
 * Calculate the price after subsidy for a product
 */
export const calculatePriceAfterSubsidy = (product: Product): number => {
  const subsidyPercentage = product.subsidy_percentage || DEFAULT_SUBSIDY_PERCENTAGE;
  return Math.round(product.price * (1 - (subsidyPercentage / 100)));
};

/**
 * Calculate the 25-year savings for a product
 */
export const calculate25YearSavings = (product: Product): number => {
  return product.monthly_savings * 12 * 25;
};

/**
 * Calculate the payback period in years for a product
 */
export const calculatePaybackYears = (product: Product): number => {
  const priceAfterSubsidy = calculatePriceAfterSubsidy(product);
  return Math.round(priceAfterSubsidy / (product.monthly_savings * 12));
};

/**
 * Calculate the subsidy amount for a product
 */
export const calculateSubsidyAmount = (product: Product): number => {
  const subsidyPercentage = product.subsidy_percentage || DEFAULT_SUBSIDY_PERCENTAGE;
  return Math.round(product.price * (subsidyPercentage / 100));
};
