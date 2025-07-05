# Product API Documentation

This document provides details about the product API endpoints for the Type 3 Solar Platform.

## Base URL

All API endpoints are relative to the base URL of the application.

## Authentication

Most GET endpoints are public and do not require authentication. Admin endpoints require authentication with appropriate permissions.

## Caching

All GET endpoints are cached for performance optimization. The cache duration is specified for each endpoint.

## Response Format

All successful responses will return a 200 status code with JSON data. Error responses will return an appropriate status code (400, 401, 403, 404, 500) with an error message in the following format:

```json
{
  "error": "Error message"
}
```

## API Endpoints

### List Products

Returns a paginated list of products with their default variants.

**URL:** `/api/products`

**Method:** `GET`

**Cache Duration:** 5 minutes

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page (max: 100) | 10 |
| category | string/array | Filter by category ID(s) | - |
| useCase | string/array | Filter by use case(s) | - |
| minPrice | number | Minimum price | - |
| maxPrice | number | Maximum price | - |
| hasSubsidy | boolean | Filter by subsidy availability | - |
| sortBy | string | Sort order (name, price_asc, price_desc, newest) | name |

**Example Request:**

```
GET /api/products?page=1&limit=10&category=residential&minPrice=50000&sortBy=price_asc
```

**Example Response:**

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "SolarPrime Residential System",
      "slug": "solarprime-residential",
      "category": {
        "id": "uuid",
        "name": "Residential",
        "slug": "residential"
      },
      "default_variant": {
        "id": "uuid",
        "capacity_kw": 2,
        "price": 165000,
        "subsidized_price": 99000
      },
      "primary_image": {
        "url": "https://example.com/image.jpg",
        "alt_text": "Product image"
      }
    }
    // Additional products...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Product by ID

Returns detailed information about a specific product by its ID.

**URL:** `/api/products/[id]`

**Method:** `GET`

**Cache Duration:** 5 minutes

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Product ID (UUID) |

**Example Request:**

```
GET /api/products/550e8400-e29b-41d4-a716-446655440000
```

**Example Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "SolarPrime Residential System",
  "slug": "solarprime-residential",
  "sku": "SP-RES-2023",
  "description": "Premium residential solar system...",
  "category": {
    "id": "uuid",
    "name": "Residential",
    "slug": "residential"
  },
  "variants": [
    {
      "id": "uuid",
      "capacity_kw": 1,
      "price": 85000,
      "subsidized_price": 51000,
      "is_default": false
    },
    {
      "id": "uuid",
      "capacity_kw": 2,
      "price": 165000,
      "subsidized_price": 99000,
      "is_default": true
    }
    // Additional variants...
  ],
  "images": [
    {
      "id": "uuid",
      "url": "https://example.com/image1.jpg",
      "alt_text": "Product image",
      "is_primary": true
    }
    // Additional images...
  ],
  "default_variant": {
    "id": "uuid",
    "capacity_kw": 2,
    "price": 165000,
    "subsidized_price": 99000,
    "is_default": true
  }
}
```

### Get Product by Slug

Returns detailed information about a specific product by its slug.

**URL:** `/api/products/slug/[slug]`

**Method:** `GET`

**Cache Duration:** 5 minutes

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | Product slug |

**Example Request:**

```
GET /api/products/slug/solarprime-residential
```

**Example Response:**

Same as the "Get Product by ID" response.

### Get Products by Category ID

Returns a paginated list of products in a specific category.

**URL:** `/api/products/category/[categoryId]`

**Method:** `GET`

**Cache Duration:** 5 minutes

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| categoryId | string | Category ID (UUID) |

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page (max: 100) | 10 |

**Example Request:**

```
GET /api/products/category/550e8400-e29b-41d4-a716-446655440000?page=1&limit=10
```

**Example Response:**

```json
{
  "products": [
    // Array of products in this category
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Products by Category Slug

Returns a paginated list of products in a specific category identified by slug.

**URL:** `/api/products/category/slug/[categorySlug]`

**Method:** `GET`

**Cache Duration:** 5 minutes

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| categorySlug | string | Category slug |

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page (max: 100) | 10 |

**Example Request:**

```
GET /api/products/category/slug/residential?page=1&limit=10
```

**Example Response:**

```json
{
  "products": [
    // Array of products in this category
  ],
  "category": {
    "id": "uuid",
    "slug": "residential"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Invalidate Cache (Admin Only)

Invalidates the API cache for specific tags or clears the entire cache.

**URL:** `/api/admin/cache/invalidate`

**Method:** `POST`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "tags": ["products", "product-detail"],  // Optional: Specific tags to invalidate
  "clearAll": false                        // Optional: Clear entire cache
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Cache invalidated for tags: products, product-detail"
}
```

## Error Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Invalid parameters or request body |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 405 | Method Not Allowed | HTTP method not supported |
| 500 | Internal Server Error | Server error |

## Caching Tags

The following cache tags are used:

- `products`: All product listings
- `product-detail`: Individual product details
- `product-category`: Category-specific product listings

When making updates to products, categories, or variants, invalidate the appropriate cache tags to ensure users see the latest data.
