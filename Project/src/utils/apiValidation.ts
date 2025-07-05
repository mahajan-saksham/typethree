/**
 * API Request Validation Utilities
 * This file provides request validation for API endpoints using Zod
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodSchema } from 'zod';

/**
 * Validates request query parameters against a Zod schema
 */
export function validateQuery<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  schema: ZodSchema<T>
): T | null {
  try {
    return schema.parse(req.query);
  } catch (error) {
    res.status(400).json({
      error: 'Invalid query parameters',
      details: error.errors
    });
    return null;
  }
}

/**
 * Validates request body against a Zod schema
 */
export function validateBody<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  schema: ZodSchema<T>
): T | null {
  try {
    return schema.parse(req.body);
  } catch (error) {
    res.status(400).json({
      error: 'Invalid request body',
      details: error.errors
    });
    return null;
  }
}

/**
 * Common validation schemas
 */

// Pagination parameters
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10)
});

// Product ID parameter
export const ProductIdSchema = z.object({
  id: z.string().uuid()
});

// Product slug parameter
export const ProductSlugSchema = z.object({
  slug: z.string().min(1).max(100)
});

// Category ID parameter
export const CategoryIdSchema = z.object({
  categoryId: z.string().uuid()
});

// Category slug parameter
export const CategorySlugSchema = z.object({
  categorySlug: z.string().min(1).max(100)
});

// Product filtering parameters
export const ProductFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  useCase: z.union([z.string(), z.array(z.string())]).optional(),
  minPrice: z.coerce.number().int().positive().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  hasSubsidy: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['name', 'price_asc', 'price_desc', 'newest']).optional().default('name')
});

// Types derived from schemas
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type ProductIdParams = z.infer<typeof ProductIdSchema>;
export type ProductSlugParams = z.infer<typeof ProductSlugSchema>;
export type CategoryIdParams = z.infer<typeof CategoryIdSchema>;
export type CategorySlugParams = z.infer<typeof CategorySlugSchema>;
export type ProductFilterParams = z.infer<typeof ProductFilterSchema>;
