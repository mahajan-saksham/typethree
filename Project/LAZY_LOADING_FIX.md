# Type 3 Solar Platform - Lazy Loading Fix

**Last Updated:** April 19, 2025

This technical document outlines the specific implementation steps to fix the lazy loading issues on Vercel for the Type 3 Solar Platform. It provides code snippets, reasoning, and a step-by-step approach for developers.

## Problem Statement

The current implementation of lazy loading in the Type 3 Solar Platform uses a custom `lazyLoad` function that constructs dynamic import paths. This approach works in development but fails when deployed to Vercel due to how Vite/Rollup handles code splitting and module analysis during build.

```tsx
// Current problematic implementation in App.tsx
const lazyLoad = (path: string) => {
  const absolutePath = path.startsWith('./') ? path : `./src/${path}`;
  return React.lazy(() => 
    import(/* @vite-ignore */ absolutePath).catch(error => {
      // Error handling
    })
  );
};

// Current usage
const Home = lazyLoad('./pages/Home');
```

Key issues with this approach:

1. **Non-analyzable Import Paths**: Vite/Rollup cannot statically analyze variable import paths.
2. **@vite-ignore Comment**: This bypasses Vite's static analysis, preventing proper code splitting.
3. **Path Manipulation**: The function attempts to resolve paths dynamically, which doesn't match how the bundler operates.
4. **Case Sensitivity**: Vercel's Linux environment is case-sensitive, unlike macOS development.

## Implementation Steps

### 1. Modify App.tsx

#### Remove the Custom lazyLoad Function

Delete the entire `lazyLoad` function from `App.tsx`.

#### Replace Dynamic Imports with Static Imports

Replace all instances of `lazyLoad` with standard React.lazy imports:

```tsx
// Before
const Home = lazyLoad('./pages/Home');
const Products = lazyLoad('./pages/Products');
const Install = lazyLoad('./pages/Install');
const ROICalculator = lazyLoad('./pages/ROICalculator');
const About = lazyLoad('./pages/About');
const DashboardRoutes = lazyLoad('./pages/Dashboard');
const AdminRoutes = lazyLoad('./pages/AdminRoutes');
const Auth = lazyLoad('./pages/Auth');

// After
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const Install = React.lazy(() => import('./pages/Install'));
const ROICalculator = React.lazy(() => import('./pages/ROICalculator'));
const About = React.lazy(() => import('./pages/About'));
const DashboardRoutes = React.lazy(() => import('./pages/Dashboard'));
const AdminRoutes = React.lazy(() => import('./pages/AdminRoutes'));
const Auth = React.lazy(() => import('./pages/Auth'));
```

#### Keep Error Handling

If the custom error handling is needed, implement it with an ErrorBoundary component:

```tsx
// In ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Check for chunk load error
      const isChunkLoadError = this.state.error?.message.includes('Loading chunk') || 
                              this.state.error?.message.includes('Failed to fetch');
                              
      if (isChunkLoadError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#0A0A0A] text-light">
            <h2 className="text-2xl font-bold text-[#CCFF00] mb-4">Module Loading Error</h2>
            <p className="mb-4">There was a problem loading this page component.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#CCFF00] text-[#0A0A0A] font-medium rounded hover:bg-[#CCFF00]/80 mb-4"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border border-[#CCFF00] text-[#CCFF00] font-medium rounded hover:bg-[#CCFF00]/10"
            >
              Go to Homepage
            </button>
          </div>
        );
      }
      
      // For other errors
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#0A0A0A] text-light">
          <h2 className="text-2xl font-bold text-[#CCFF00] mb-4">Something went wrong</h2>
          <p className="mb-4">An error occurred while rendering this component.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#CCFF00] text-[#0A0A0A] font-medium rounded hover:bg-[#CCFF00]/80"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 2. Create Vercel Configuration

Create a `vercel.json` file in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*).(js|css|svg|png|jpg|jpeg|gif|ico|json)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 3. Verify File Case Sensitivity

Ensure all import paths match exact case of the actual files:

1. Check `Home.tsx` vs `./pages/Home`
2. Check `Products.tsx` vs `./pages/Products`
3. Check `Install.tsx` vs `./pages/Install`
4. Check `ROICalculator.tsx` vs `./pages/ROICalculator`
5. Check `About.tsx` vs `./pages/About`
6. Check `Dashboard/index.tsx` vs `./pages/Dashboard`
7. Check `AdminRoutes.tsx` vs `./pages/AdminRoutes`
8. Check `Auth.tsx` vs `./pages/Auth`

### 4. Review vite.config.ts (Optional)

If you have path aliasing or specific build configurations, ensure they're correctly set up:

```js
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Group logical features into their own chunks
          admin: ['./src/pages/AdminRoutes.tsx'],
          dashboard: ['./src/pages/Dashboard/index.tsx']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 5. Testing Procedure

#### Local Testing

1. Run the build: `npm run build`
2. Preview the build: `npm run preview`
3. Test each route in the application:
   - Navigate to the route through the UI
   - Access the route directly by URL
   - Refresh the page on each route
4. Check the browser console for any errors
5. Monitor network requests to ensure chunks load correctly

#### Deployment Testing

1. Deploy to Vercel
2. Test all routes on the deployed version
3. Check for any 404 errors or module loading failures
4. Verify that all features work as expected

## Common Issues and Solutions

### Still Seeing 404 Errors

- Double-check the `vercel.json` file is in the project root
- Verify that the rewrites rule is correctly configured
- Ensure the build output contains all necessary files

### Module Loading Fails for Specific Routes

- Verify the case sensitivity of the affected route
- Check for any conditional imports or dynamic path construction
- Ensure the component is exported as default from its module

### Chunk Load Errors After Deployment

- May be due to cached chunks from a previous build
- Add a version query parameter to force cache invalidation
- Implement a graceful reload mechanism for chunk load failures

## Benefits of This Approach

1. **Static Analysis**: Vite can properly analyze the imports and create optimal chunks
2. **Bundle Optimization**: Proper code splitting for better performance
3. **Predictable Behavior**: Consistent loading behavior in all environments
4. **Maintainability**: Standard React.lazy pattern is easier to understand
5. **Error Resilience**: Better error handling for module loading failures

## References

- [Vite Dynamic Import Documentation](https://vitejs.dev/guide/features.html#dynamic-import)
- [React.lazy Documentation](https://react.dev/reference/react/lazy)
- [Vercel SPA Configuration Guide](https://vercel.com/docs/project-configuration#rewrites)
- [Rollup Code Splitting Guide](https://rollupjs.org/guide/en/#code-splitting)
