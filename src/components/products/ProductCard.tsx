import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Calendar, Shield } from 'lucide-react';

interface ProductCardProps { product: any; }

const getCategoryColor = (useCase: string) => {
  switch (useCase?.toLowerCase()) {
    case 'residential': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'commercial': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    case 'industrial': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    default: return 'text-green-400 bg-green-500/10 border-green-500/20';
  }
};

const generateWhatsAppLink = (productName: string, capacity: string) => {
  const message = `Hi Team Type3, I'm interested in the ${productName} (${capacity}). Please provide more details and a quote.`;
  return `https://wa.me/918095508066?text=${encodeURIComponent(message)}`;
};

export function ProductCard({ product }: ProductCardProps) {
  if (!product) return null;
  
  // Get pricing details
  const originalPrice = product.price || 0;
  const salePrice = product.sale_price || originalPrice;
  const hasDiscount = salePrice < originalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
  
  const subsidyAmount = product.subsidy_amount || 0;
  const monthlySavings = product.monthly_savings || 0;
  const capacity = product.capacity || product.capacity_kw || '1kW';
  const warrantyYears = product.warranty_years || 25;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group h-full"
    >
      <div className="h-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-black/20">
        
        {/* Product Image Section */}
        <Link to={`/products/${product.id}`} className="relative block overflow-hidden">
          <div className="aspect-[4/3] relative">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80";
              }}
            />
            
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              {/* Category badge */}
              {product.useCase && (
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getCategoryColor(product.useCase)}`}>
                  {product.useCase}
                </div>
              )}
              
              {/* Capacity badge */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                ⚡ {capacity}
              </div>
            </div>

            {/* Bottom badges */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              {/* Discount badge */}
              {hasDiscount && (
                <div className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                  {discountPercent}% OFF
                </div>
              )}

              {/* Subsidy badge */}
              {subsidyAmount > 0 && (
                <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold ml-auto">
                  ₹{(subsidyAmount/1000).toFixed(0)}K Subsidy
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Content Section */}
        <div className="p-6">
          {/* Product Title & Description */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2 leading-tight group-hover:text-green-400 transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
              {product.short_description || product.description}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {monthlySavings > 0 && (
              <div className="text-center">
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Monthly Savings</div>
                <div className="text-green-400 font-semibold">₹{monthlySavings.toLocaleString()}</div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Warranty</div>
              <div className="text-white font-semibold">{warrantyYears} Years</div>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl font-bold text-white">₹ {salePrice.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                )}
              </div>
              
              {subsidyAmount > 0 && (
                <div className="text-xs text-green-400 font-medium">
                  Inclusive of ₹{subsidyAmount.toLocaleString()} government subsidy
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            {/* Primary CTA */}
            <a
              href={generateWhatsAppLink(product.name, capacity)}
              target="_blank"
              rel="noopener noreferrer"
              className="group/cta flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-400 text-black py-3.5 px-6 rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-green-500/25 hover:shadow-xl"
            >
              <MessageCircle className="h-4 w-4 transition-transform group-hover/cta:scale-110" />
              <span>Get Quote on WhatsApp</span>
            </a>

            {/* Secondary CTA */}
            <Link 
              to={`/products/${product.id}`}
              className="group/view flex items-center justify-center gap-2 w-full border border-white/20 text-gray-300 hover:text-white hover:border-white/40 py-3 px-6 rounded-xl transition-all duration-300 font-medium text-sm hover:bg-white/[0.02]"
            >
              <span>View Details</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/view:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}