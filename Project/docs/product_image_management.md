# Product Image Management System

This document outlines the implementation details of the product image management system for the Type 3 Solar Platform.

## Overview

The image management system provides functionalities for:

1. **Image Storage**: Secure storage of product images in Supabase Storage
2. **Image Optimization**: Automatic resizing and format conversion for optimal delivery
3. **CDN Integration**: Optimized image delivery through a CDN
4. **Responsive Images**: UI components that support responsive images with proper srcset
5. **Admin Interface**: Tools for uploading, managing, and organizing product images

## Image Storage Architecture

### Storage Structure

Images are stored in Supabase Storage with the following structure:

```
product-images/
├── {product_id}/
│   ├── {uuid}.jpg
│   ├── {uuid}.png
│   └── {uuid}.webp
└── {product_id}/
    ├── {uuid}.jpg
    └── {uuid}.png
```

Each product has its own folder identified by the product ID, and each image has a unique UUID filename.

### Database Structure

Images are tracked in the `product_images` table with the following schema:

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES product_skus(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Key features:
- `is_primary` flag for the main product image
- `display_order` for controlling the order of additional images
- `alt_text` for accessibility and SEO

## Image Optimization

### Size Variants

The system automatically generates multiple size variants for each uploaded image:

| Size | Dimensions | Purpose |
|------|------------|---------|
| thumbnail | 200x200 | Product thumbnails, cart items |
| small | 400x400 | Product cards, small displays |
| medium | 800x800 | Product detail main image |
| large | 1200x1200 | Full-screen views, zoom |
| original | Original size | Source file preservation |

### Format Conversion

Images are converted to WebP format when supported by the browser, with fallbacks to the original format for older browsers. This is managed through the `<ResponsiveImage>` component.

### Optimization Parameters

- **Quality**: 80% for standard images, 90% for primary product images
- **Metadata**: Strips unnecessary EXIF data for faster loading
- **Compression**: Applies lossless compression for PNG, lossy for JPEG

## CDN Integration

### Cache Configuration

The system applies the following cache settings for optimal delivery:

```
Cache-Control: public, max-age=31536000, immutable
Vary: Accept
```

This ensures:
- Long-term caching (1 year) for static assets
- Proper variation based on browser support
- Immutable flag to prevent revalidation

### CORS Configuration

Images are served with the following CORS headers to ensure they can be accessed from any domain:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Max-Age: 86400
```

### Supabase CDN Integration

Supabase Storage provides built-in CDN capabilities through its transformation API. The `getOptimizedImageUrl` function transforms image URLs to leverage these features:

```typescript
function getOptimizedImageUrl(url: string, size: ImageSize = 'medium'): string {
  // Convert regular Supabase URL to transformation URL
  // Example: 
  // From: /storage/v1/object/public/product-images/123/image.jpg
  // To: /storage/v1/transform/public/product-images/123/image.jpg?resize=width:800,height:800
}
```

## UI Components

### ResponsiveImage Component

The `<ResponsiveImage>` component handles:

- Proper srcset and sizes attributes for responsive loading
- Lazy loading for improved performance
- WebP support with fallbacks
- Loading placeholders and error states
- Configurable aspect ratio and object-fit properties

Usage:

```tsx
<ResponsiveImage
  src={product.primary_image.url}
  alt={product.primary_image.alt_text}
  size="medium"
  aspectRatio={1}
  lazy={true}
  responsive={true}
/>
```

### ImageUpload Component

The `<ImageUpload>` component provides a complete interface for:

- Drag and drop image uploading
- Progress tracking
- Image preview and management
- Primary image selection
- Image reordering via drag and drop
- Validation and error handling

## API Endpoints

The following API endpoints handle image operations:

### List Images

```
GET /api/products/images?productId=...
```

Returns all images for a specific product.

### Upload Image

```
POST /api/products/images/upload
```

Uploads a new image for a product, with support for metadata like alt text and primary flag.

### Update Image

```
PATCH /api/products/images/[id]
```

Updates image metadata such as alt text, primary status, or display order.

### Delete Image

```
DELETE /api/products/images/delete/[id]
```

Deletes an image from both storage and the database.

## Security Considerations

1. **Authentication**: All image modification API endpoints require administrator authentication
2. **Validation**: 
   - File type restrictions (.jpg, .png, .webp)
   - Size limits (max 5MB)
   - Secure filename generation (UUIDs)
3. **CORS**: Restricted to application domains
4. **Content Security Policy**: Controls where images can be loaded

## Performance Optimization

1. **Lazy Loading**: Images load only when they enter the viewport
2. **Responsive Loading**: Different sized images based on viewport size
3. **Format Conversion**: WebP delivery for modern browsers
4. **Caching**: Aggressive caching of static assets
5. **Placeholders**: Low-resolution or blur-up placeholders during loading

## Implementation Examples

### Uploading an Image

```typescript
// Client-side upload function
async function uploadProductImage(file: File, productId: string, isPrimary: boolean) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify({
    productId,
    altText: file.name,
    isPrimary,
    displayOrder: 0
  }));
  
  const response = await fetch('/api/products/images/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}
```

### Displaying Product Images

```tsx
// Product detail page with main image and thumbnails
function ProductImages({ product }) {
  const [selectedImage, setSelectedImage] = useState(
    product.images.find(img => img.is_primary) || product.images[0]
  );
  
  return (
    <div className="product-images">
      {/* Main image */}
      <div className="main-image">
        <ResponsiveImage
          src={selectedImage.url}
          alt={selectedImage.alt_text}
          size="large"
          aspectRatio={1}
        />
      </div>
      
      {/* Thumbnails */}
      <div className="thumbnails">
        {product.images.map(image => (
          <button
            key={image.id}
            className={`thumbnail ${selectedImage.id === image.id ? 'active' : ''}`}
            onClick={() => setSelectedImage(image)}
          >
            <ResponsiveImage
              src={image.url}
              alt={image.alt_text}
              size="thumbnail"
              aspectRatio={1}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```
