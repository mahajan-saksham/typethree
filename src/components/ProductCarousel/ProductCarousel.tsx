import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products, Product } from '../../data/products';

interface CarouselProduct {
  id: string;
  name: string;
  capacity: string;
  startingPrice: string;
  monthlySavings: string;
  keyBenefit: string;
  image: string;
  category: string;
  route: string;
  originalPrice: string;
  subsidyAmount: string;
  warrantyYears: number;
  installationTime: string;
}

// Get featured products from actual product data
const getFeaturedProducts = (): CarouselProduct[] => {
  // Select representative products for carousel
  const featuredProductIds = ['ONGRID-3KW-001', 'ONGRID-5KW-001', 'ONGRID-10KW-001'];
  
  return featuredProductIds.map(id => {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    
    // Determine category and key benefit based on actual product data
    let category = product.useCase || 'Residential';
    let keyBenefit = product.short_description || product.targetAudience || 'Perfect for homes';
    
    return {
      id: product.id,
      name: product.name,
      capacity: product.capacity || `${product.capacity_kw}kW`,
      startingPrice: `₹${(product.sale_price / 100000).toFixed(1)}L`,
      monthlySavings: `₹${(product.monthly_savings || 0).toLocaleString()}`,
      keyBenefit,
      image: product.image_url || `https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&w=1200&q=80`,
      category,
      route: `/products/${product.id}`,
      // Add real product data
      originalPrice: `₹${(product.price / 100000).toFixed(1)}L`,
      subsidyAmount: product.subsidyAmount || `₹${(product.subsidy_amount || 0).toLocaleString()}`,
      warrantyYears: product.warranty_years || 25,
      installationTime: product.installation_time || '3-4 days'
    };
  }).filter(Boolean) as CarouselProduct[];
};

const featuredProducts = getFeaturedProducts();

export const ProductCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 8000); // Increased from 5000ms to 8000ms (8 seconds)

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentProduct = featuredProducts[currentSlide];

  return (
    <div 
      className="relative w-full h-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Single AnimatePresence for all slide content */}
      <AnimatePresence>
        <motion.div
          key={currentSlide}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <motion.img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.1, 0.25, 1]
              }}
              onError={(e) => {
                // Fallback to a default solar image if product image fails
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          {/* Category Badge - Top Left */}
          <div className="absolute top-4 left-4 z-30">
            <div className="inline-flex items-center px-3 py-2 rounded-full bg-black/40 backdrop-blur-lg border border-primary/40">
              <span className="text-primary font-semibold text-sm">{currentProduct.category}</span>
            </div>
          </div>

          {/* Product Information Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="p-4 md:p-6">
              {/* Ultra Clean Product Card */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl max-w-lg mx-auto">
                <div className="space-y-4">
                  
                  {/* Product Title Only */}
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-xl md:text-2xl leading-tight">
                      {currentProduct.name}
                    </h3>
                  </div>

                  {/* Stats & CTA Row */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="grid grid-cols-2 gap-6 flex-1">
                      <div>
                        <div className="text-white/50 text-xs mb-1">Monthly Savings</div>
                        <div className="text-green-400 font-semibold text-base">
                          {currentProduct.monthlySavings}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/50 text-xs mb-1">Warranty</div>
                        <div className="text-white font-semibold text-base">
                          {currentProduct.warrantyYears} Years
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      to={currentProduct.route}
                      className="ml-6 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
                    >
                      Details
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Auto-play progress indicator */}
      <div className="absolute top-4 right-4 z-30">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center">
          <div 
            className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-primary/60 border-t-primary"
            style={{
              animation: isAutoPlaying ? 'spin 8s linear infinite' : 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;