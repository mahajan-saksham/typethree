/**
 * Pages Implementation
 * These files integrate our product components with Next.js pages
 */

// File: src/pages/products/index.tsx
import { ProductsPage } from '@/components/products/ProductsPage';
import { SWRConfig } from 'swr';

export default function Products() {
  return (
    <SWRConfig 
      value={{
        // Revalidate on focus (e.g., when user comes back to the window)
        revalidateOnFocus: false,
        // Error retries with exponential backoff
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          // Only retry up to 3 times
          if (retryCount >= 3) return;
          
          // Retry after 3 seconds, then 9, then 27
          setTimeout(() => revalidate({ retryCount }), 3000 * (3 ** retryCount));
        },
      }}
    >
      <ProductsPage />
    </SWRConfig>
  );
}

// File: src/pages/products/[slug].tsx
import { ProductDetailPage } from '@/components/products/ProductDetailPage';
import { SWRConfig } from 'swr';
import { useRouter } from 'next/router';

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;
  
  // Handle loading state (SSR or route changes)
  if (!slug || typeof slug !== 'string') {
    return <div>Loading...</div>;
  }
  
  return (
    <SWRConfig 
      value={{
        revalidateOnFocus: false,
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          if (retryCount >= 3) return;
          setTimeout(() => revalidate({ retryCount }), 3000 * (3 ** retryCount));
        },
      }}
    >
      <ProductDetailPage slug={slug} />
    </SWRConfig>
  );
}

// File: src/pages/products/category/[categorySlug].tsx
import { ProductsPage } from '@/components/products/ProductsPage';
import { SWRConfig } from 'swr';
import { useRouter } from 'next/router';

export default function ProductsByCategory() {
  const router = useRouter();
  const { categorySlug } = router.query;
  
  // Handle loading state (SSR or route changes)
  if (!categorySlug || typeof categorySlug !== 'string') {
    return <div>Loading...</div>;
  }
  
  return (
    <SWRConfig 
      value={{
        revalidateOnFocus: false,
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          if (retryCount >= 3) return;
          setTimeout(() => revalidate({ retryCount }), 3000 * (3 ** retryCount));
        },
      }}
    >
      <ProductsPage initialCategory={categorySlug} />
    </SWRConfig>
  );
}
