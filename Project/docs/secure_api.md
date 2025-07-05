# Secure Supabase API Implementation

## Overview

This documentation explains the secure Supabase API implementation for the Type 3 Solar Platform. The implementation moves sensitive Supabase credential handling from client-side code to server-side API routes, enhancing security by preventing exposure of database credentials.

## Architecture

The implementation follows a secure client-server architecture:

1. **Server-Side API Routes**: Secure API endpoints that handle database operations
2. **Client-Side Hooks**: React hooks that interface with the API endpoints
3. **Security Middleware**: Authentication and authorization middleware for API routes

## Security Benefits

- **Credential Protection**: Supabase service role key is never exposed to the client
- **API Authentication**: All sensitive operations require authentication
- **Role-Based Access Control**: Admin-only endpoints are protected
- **Rate Limiting**: Protection against abuse and DoS attacks

## Implementation Components

### Server-Side Components

1. **`apiClient.ts`**: Server-side Supabase client with secure methods
2. **`middleware.ts`**: Authentication and authorization middleware
3. **API Routes**: Next.js API routes for database operations

### Client-Side Components

1. **`useSecureApi.ts`**: Generic hook for API operations
2. **`useProducts.ts`**: Product-specific hook using the secure API
3. **`ProductsListSecure.tsx`**: Example component using secure hooks

## Usage Examples

### Creating API Routes

```typescript
// src/pages/api/resource/[id].ts
import { withAuth, withAdmin, withRateLimit } from '../../../server/middleware';
import { secureApi } from '../../../server/apiClient';

// Use middleware composition for security
export default withRateLimit()(
  withAuth(async (req, res) => {
    const { id } = req.query;
    
    // Implement your resource handling here
    const { data, error } = await secureApi.getResourceById(id);
    
    if (error) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    return res.status(200).json({ data });
  })
);
```

### Using the Secure API Hook

```tsx
function ProductDetails({ productId }) {
  const { fetchData, data, error, isLoading } = useSecureApi();
  
  useEffect(() => {
    fetchData(`products/${productId}`);
  }, [productId, fetchData]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  const product = data?.product;
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${(product.price / 100).toFixed(2)}</p>
    </div>
  );
}
```

## Setting Up API Routes

1. Create API route files in `src/pages/api/`
2. Apply security middleware as needed
3. Implement route logic using `secureApi` methods
4. Add proper error handling and status codes

## Best Practices

1. **Always Use Middleware**: Apply authentication middleware for protected routes
2. **Validate Input**: Validate all input parameters before processing
3. **Handle Errors**: Properly catch and handle all errors
4. **Use Rate Limiting**: Apply rate limiting to prevent abuse
5. **Cache Responses**: Use cache headers for improved performance
6. **Log Securely**: Avoid logging sensitive information

## Migration Guide

To migrate existing components from direct Supabase calls:

1. Create API routes for each database operation
2. Implement hooks to interact with those routes
3. Update components to use the new hooks
4. Remove direct Supabase client imports and usage

## Troubleshooting

Common issues:

- **401 Unauthorized**: Authentication token missing or invalid
- **403 Forbidden**: User lacks required permissions
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded

## Further Security Enhancements

- Implement CSP headers for additional protection
- Set up CORS restrictions for API routes
- Consider implementing JWT token rotation
- Add comprehensive logging and monitoring
