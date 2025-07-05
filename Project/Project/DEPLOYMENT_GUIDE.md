# Type 3 Solar Platform - Deployment Guide

**Last Updated:** April 19, 2025

This guide provides comprehensive instructions for deploying the Type 3 Solar Platform to Vercel and other hosting environments. It covers common issues, best practices, and troubleshooting steps with special attention to code splitting and lazy loading.

## Table of Contents

- [Deployment Checklist](#deployment-checklist)
- [Lazy Loading Implementation](#lazy-loading-implementation)
- [Vercel Configuration](#vercel-configuration)
- [Testing Procedures](#testing-procedures)
- [Common Issues & Solutions](#common-issues--solutions)
- [Performance Optimization](#performance-optimization)

## Deployment Checklist

Before deploying, ensure you have completed the following:

- [ ] All environment variables are set on the deployment platform
- [ ] Build completes successfully locally (`npm run build`)
- [ ] Application routes work correctly in local preview (`npm run preview`)
- [ ] Static assets are loading correctly
- [ ] No console errors related to module loading
- [ ] Vercel configuration file is present and correct
- [ ] Database migrations have been applied

## Lazy Loading Implementation

### Standard Pattern (Use This ✅)

For proper code splitting and lazy loading on Vercel, always use static import paths with `React.lazy`:

```tsx
// Good - Static import path that Vite can analyze
const Home = React.lazy(() => import('./pages/Home'));

// Route usage
<Route path="/" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Home />
  </Suspense>
} />
```

### Problematic Pattern (Avoid This ❌)

Do not use dynamic path construction or string manipulation for imports:

```tsx
// Bad - Dynamic import path that Vite cannot analyze
const lazyLoad = (path) => React.lazy(() => import(/* @vite-ignore */ path));
const Home = lazyLoad('./pages/Home');
```

### Error Handling for Lazy Components

Always wrap lazy-loaded components with both Suspense and ErrorBoundary:

```tsx
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<LoadingSpinner />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

## Vercel Configuration

### vercel.json

Create a `vercel.json` file in the project root with the following configuration:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "github": {
    "silent": true
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=0" }
      ]
    },
    {
      "source": "/(.*).(js|css|svg|png|jpg|jpeg|gif|ico|json)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

This configuration:
- Redirects all routes to `index.html` for client-side routing
- Sets appropriate caching headers
- Silences GitHub deployment comments

### Environment Variables

Ensure the following environment variables are set in Vercel:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous API key
- Any other environment-specific variables

## Testing Procedures

### Local Build Testing

```bash
# Build the application
npm run build

# Preview the built application
npm run preview
```

After starting the preview server:

1. Navigate to each main route in the application
2. Check browser console for any errors
3. Monitor network tab to verify chunks are loading correctly
4. Test direct URL access to deep routes
5. Verify that lazy-loaded components render correctly

### Vercel Preview Deployments

Vercel automatically creates preview deployments for pull requests. Use these to:

1. Verify that the application builds correctly on Vercel
2. Test all routes on the deployed version
3. Check loading performance with tools like Lighthouse
4. Verify that environment variables are working

## Common Issues & Solutions

### 404 Errors on Direct Route Access

**Issue**: Navigating directly to a route (e.g., `/dashboard`) results in a 404 error.

**Solution**: Ensure the `vercel.json` file has the correct rewrite rule to send all routes to `index.html`.

### Module Loading Errors

**Issue**: Console shows errors like "Failed to load module" or "Chunk loading failed".

**Solution**:
1. Convert all dynamic imports to static imports
2. Ensure case sensitivity matches between import statements and file names
3. Check that the path in the import statement is correct

### Environment Variable Issues

**Issue**: Application fails with missing environment variables.

**Solution**:
1. Verify all required environment variables are set in Vercel
2. Ensure `import.meta.env` variables are accessed correctly
3. Avoid using fallback hardcoded values in production

### Bundle Size Issues

**Issue**: Large JavaScript bundles causing slow initial load.

**Solution**:
1. Use code splitting with React.lazy
2. Implement route-based code splitting
3. Configure Vite to split vendor chunks appropriately

## Performance Optimization

### Code Splitting Strategy

Use the following strategy for code splitting:

1. Split by route for main page components
2. Split large third-party libraries into vendor chunks
3. Split infrequently used features into separate chunks

### Vite Configuration for Optimal Splitting

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          // Group admin features together
          admin: ['./src/pages/AdminRoutes.tsx'],
          // Group dashboard features together
          dashboard: ['./src/pages/Dashboard/index.tsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Preloading and Prefetching

Implement preloading for critical resources and prefetching for likely navigation paths:

```tsx
function App() {
  // Prefetch Dashboard when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const prefetchDashboard = () => import('./pages/Dashboard');
      prefetchDashboard();
    }
  }, [isAuthenticated]);
  
  // Rest of the component
}
```

## Regular Maintenance

### Deployment Monitoring

- Monitor application error rates after deployment
- Check for chunk loading failures in production logs
- Verify all routes are accessible after deployment

### Cache Invalidation

When making changes to already deployed code:

1. Consider adding a `?v={version}` query parameter to force cache invalidation
2. Monitor for stale chunk issues during the transition period
3. Implement a refresh mechanism for users with outdated chunks

---

For questions or issues related to deployment, please contact the platform administrator or refer to the [Codebase Maintenance Documentation](./CODEBASE_MAINTENANCE.md).
