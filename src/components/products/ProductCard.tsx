import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface ProductCardProps { product: any; }

const getCategoryColor = (useCase: string) => {
  switch (useCase?.toLowerCase()) {
    case 'residential': return 'text-residential bg-residential/5 border-residential/10';
    case 'commercial': return 'text-commercial bg-commercial/5 border-commercial/10';
    case 'industrial': return 'text-industrial bg-industrial/5 border-industrial/10';
    default: return 'text-primary bg-primary/5 border-primary/10';
  }
};

const generateWhatsAppLink = (productName: string, capacity: string) => {
  const message = `Hi Team Type3, I'm interested in the ${productName} (${capacity}). Please provide more details and a quote.`;
  return `https://wa.me/918095508066?text=${encodeURIComponent(message)}`;
};

export function ProductCard({ product }: ProductCardProps) {
  if (!product) return null;
  
  // Standardized data extraction to ensure consistency
  const originalPrice = product.price || 0;
  const salePrice = product.sale_price || originalPrice;
  const hasDiscount = salePrice < originalPrice && originalPrice > 0;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
  
  const subsidyAmount = product.subsidy_amount || 0;
  const monthlySavings = product.monthly_savings || 0;
  const capacity = product.capacity ? `${product.capacity}kW` : (product.capacity_kw || '1kW');
  const warrantyYears = product.warranty_years || 25;
  const useCase = product.useCase || product.category || 'Residential';
  
  // The sale_price already includes the subsidy discount, so we display that as the final price

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="group h-full"
    >
      <div className="h-full relative overflow-hidden rounded-3xl flex flex-col">
        {/* Glassmorphism background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl border border-white/[0.08] rounded-3xl transition-all duration-500 group-hover:border-white/[0.15] group-hover:bg-gradient-to-br group-hover:from-white/[0.12] group-hover:via-white/[0.06] group-hover:to-white/[0.02]" />
        
        {/* Subtle inner glow effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/[0.05] via-transparent to-secondary/[0.05]" />
        
        <div className="relative z-10 h-full flex flex-col">
          
          {/* Product Image Section - Fixed Height */}
          <Link to={`/products/${product.id}`} className="relative block overflow-hidden rounded-t-3xl">
            <div className="aspect-[5/4] relative">
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80";
                }}
              />
              
              {/* Elegant gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              
              {/* Top badges - Consistent positioning */}
              <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
                {/* Category badge - Always present */}
                <div className={`px-4 py-2 rounded-2xl text-xs font-medium border backdrop-blur-2xl ${getCategoryColor(useCase)}`}>
                  {useCase}
                </div>
                
                {/* Capacity badge - Always present */}
                <div className="bg-black/20 backdrop-blur-2xl border border-white/10 text-white px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  {capacity}
                </div>
              </div>

              {/* Bottom badges - Consistent positioning */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                {/* Discount badge - Fixed width placeholder to maintain layout */}
                <div className="flex">
                  {hasDiscount && (
                    <div className="bg-error/90 backdrop-blur-2xl border border-error/20 text-white px-4 py-2 rounded-2xl text-xs font-medium">
                      {discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Subsidy badge - Always show if available */}
                <div className="flex">
                  {subsidyAmount > 0 && (
                    <div className="bg-success/80 backdrop-blur-2xl border border-success/20 text-white px-4 py-2 rounded-2xl text-xs font-medium">
                      ₹{(subsidyAmount/1000).toFixed(0)}K Subsidy
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>

          {/* Content Section - Flexible */}
          <div className="flex-1 p-7 flex flex-col">
            {/* Product Title & Description - Fixed height area */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3 leading-tight group-hover:text-primary transition-colors duration-500 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed opacity-80 line-clamp-2">
                {product.short_description || product.description || 'Premium solar solution for your energy needs'}
              </p>
            </div>

            {/* Metrics grid - Consistent layout */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-medium">Monthly Savings</div>
                <div className="text-success font-semibold text-lg">
                  {monthlySavings > 0 ? `₹${monthlySavings.toLocaleString()}` : '₹0'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-medium">Warranty</div>
                <div className="text-white font-semibold text-lg">{warrantyYears} Years</div>
              </div>
            </div>

            {/* Price section - Consistent height and styling */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.05] backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl font-light text-white tracking-tight">
                    ₹ {salePrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-500 line-through font-light">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-success/80 font-medium tracking-wide min-h-[1rem]">
                  {subsidyAmount > 0 ? `Inclusive of ₹${subsidyAmount.toLocaleString()} government subsidy` : ''}
                </div>
              </div>
            </div>

            {/* CTA buttons - Fixed at bottom, consistent styling */}
            <div className="mt-auto">
              <div className="grid grid-cols-2 gap-3">
                {/* Primary CTA - Yellow Get Quote button */}
                <a
                  href={generateWhatsAppLink(product.name, capacity)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/cta relative flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-xl transition-all duration-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {/* Button background with yellow gradient */}
                  <div className="absolute inset-0 bg-primary transition-all duration-500 group-hover/cta:bg-primary-hover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-dark transition-transform group-hover/cta:scale-110 duration-300 flex-shrink-0" />
                    <span className="text-dark font-semibold text-sm tracking-wide whitespace-nowrap">Get Quote</span>
                  </div>
                </a>

                {/* Secondary CTA - Details button */}
                <Link 
                  to={`/products/${product.id}`}
                  className="group/view flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:border-white/30 transition-all duration-500 font-medium text-sm tracking-wide backdrop-blur-sm hover:bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <span className="whitespace-nowrap">Details</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/view:translate-x-1 duration-300 flex-shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </motion.div>
  );
}