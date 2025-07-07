import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface ProductCardProps { product: any; }

const getCategoryColor = (useCase: string) => {
  switch (useCase?.toLowerCase()) {
    case 'residential': return 'text-dark bg-residential';
    case 'commercial': return 'text-dark bg-commercial';
    case 'industrial': return 'text-white bg-industrial';
    default: return 'text-dark bg-primary';
  }
};

const generateWhatsAppLink = (productName: string, capacity: string) => {
  const message = `Hi Team Type3, I'm interested in the ${productName} (${capacity}). Please provide more details and a quote.`;
  return `https://wa.me/918095508066?text=${encodeURIComponent(message)}`;
};

export function ProductCard({ product }: ProductCardProps) {
  if (!product) return null;
  
  // Clean data extraction
  const originalPrice = product.price || 0;
  const salePrice = product.sale_price || originalPrice;
  const hasDiscount = salePrice < originalPrice && originalPrice > 0;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
  
  const subsidyAmount = product.subsidy_amount || 0;
  const monthlySavings = product.monthly_savings || 0;
  const capacity = product.capacity ? `${product.capacity}kW` : (product.capacity_kw || '1kW');
  const warrantyYears = product.warranty_years || 25;
  const useCase = product.useCase || product.category || 'Residential';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
      className="group h-full"
    >
      <div className="h-full bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden transition-all duration-300 border border-white/10 hover:border-primary/20 group-hover:shadow-xl group-hover:shadow-black/20 backdrop-blur-sm relative flex flex-col">
        
        {/* Enhanced background effects matching home page patterns */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.05) 0%, rgba(0, 0, 0, 0) 45%)",
            }}
          />
          <div
            className="absolute top-0 right-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.05) 0%, rgba(0, 0, 0, 0) 45%)",
            }}
          />
        </div>
        
        {/* Product Image */}
        <Link to={`/products/${product.id}`} className="relative block z-10">
          <div className="aspect-[5/4] relative overflow-hidden">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80";
              }}
            />
            
            {/* Enhanced overlay with subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
            
            {/* Discount badge - enhanced design */}
            {hasDiscount && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="absolute top-3 left-3"
              >
                <div className="bg-error text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm border border-error/20">
                  -{discountPercent}%
                </div>
              </motion.div>
            )}

            {/* Category badge - enhanced design */}
            <div className="absolute top-3 right-3">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border shadow-lg ${getCategoryColor(useCase)} ${useCase?.toLowerCase() === 'industrial' ? 'border-white/20' : 'border-black/20'}`}
              >
                {useCase}
              </motion.span>
            </div>
          </div>
        </Link>

        {/* Content - Enhanced spacing and effects with responsive adjustments */}
        <div className="flex-1 p-3 lg:p-4 flex flex-col relative z-10">
          
          {/* Product name and description */}
          <div className="mb-3 lg:mb-4">
            <motion.h3 
              className="text-base lg:text-lg font-bold text-white leading-tight mb-2 group-hover:text-primary transition-colors duration-200"
            >
              {product.name}
            </motion.h3>
            <p className="text-xs lg:text-sm text-gray-400 leading-relaxed line-clamp-2">
              {product.short_description || product.description || 'High-efficiency solar solution'}
            </p>
          </div>

          {/* Key metrics - enhanced with better visual hierarchy and responsive sizing */}
          <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-3 lg:mb-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-2 lg:p-3 rounded-lg bg-white/5 border border-white/10 hover:border-success/20 transition-all duration-200"
            >
              <div className="text-xs text-gray-500 mb-1 font-medium">Monthly Savings</div>
              <div className="text-sm lg:text-base font-bold text-success">
                ₹{monthlySavings > 0 ? monthlySavings.toLocaleString() : '2,500+'}
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-2 lg:p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/20 transition-all duration-200"
            >
              <div className="text-xs text-gray-500 mb-1 font-medium">Warranty</div>
              <div className="text-sm lg:text-base font-bold text-white">{warrantyYears} Years</div>
            </motion.div>
          </div>

          {/* Price section - enhanced design with responsive sizing */}
          <div className="mb-3 lg:mb-4 p-2 lg:p-3 rounded-lg bg-white/5 border border-white/10">
            {hasDiscount && (
              <div className="text-xs lg:text-sm text-gray-500 line-through mb-1">
                ₹{originalPrice.toLocaleString()}
              </div>
            )}
            <div className="text-xl lg:text-2xl font-bold text-white mb-1">
              ₹{salePrice.toLocaleString()}
            </div>
            {subsidyAmount > 0 && (
              <div className="text-xs text-success font-medium">
                Includes ₹{subsidyAmount.toLocaleString()} govt. subsidy
              </div>
            )}
          </div>

          {/* CTA buttons - enhanced with better animations and responsive sizing */}
          <div className="mt-auto">
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {/* Primary CTA */}
              <motion.a
                href={generateWhatsAppLink(product.name, capacity)}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary hover:bg-primary-hover text-dark font-bold text-xs md:text-sm py-2 md:py-2.5 px-2 lg:px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 lg:gap-1.5 shadow-lg hover:shadow-xl min-w-0 btn-responsive"
              >
                <MessageCircle className="h-3 md:h-4 w-3 md:w-4 flex-shrink-0" />
                <span className="truncate">Get Quote</span>
              </motion.a>

              {/* Secondary CTA */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to={`/products/${product.id}`}
                  className="border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-semibold text-xs md:text-sm py-2 md:py-2.5 px-2 lg:px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 lg:gap-1.5 hover:bg-white/5 backdrop-blur-sm min-w-0 btn-responsive"
                >
                  <span className="truncate">Details</span>
                  <ArrowRight className="h-3 md:h-4 w-3 md:w-4 flex-shrink-0" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}