import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, MessageCircle, Wallet, Shield, IndianRupee } from 'lucide-react';

interface ProductCardProps { product: any; }

const getBadgeColor = (useCase: string) => {
  switch (useCase?.toLowerCase()) {
    case 'residential': return 'bg-[#CCFF00] text-black';
    case 'commercial': return 'bg-[#00D4FF] text-black';
    case 'industrial': return 'bg-[#FF7E36] text-black';
    default: return 'bg-primary text-black';
  }
};

const generateWhatsAppLink = (productName: string, capacity: string) => {
  const message = `Hi Team Type3, I'm interested in the ${productName} (${capacity}) solar solution.`;
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
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative bg-gradient-to-b from-dark to-dark-900 rounded-2xl overflow-hidden"
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          background: "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.08) 0%, rgba(0, 0, 0, 0) 45%)",
        }} />
        <div className="absolute inset-0 z-0 opacity-5" style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 20px)",
          backgroundSize: "20px 20px"
        }} />
      </div>
      <div className="transition-all duration-500 border border-white/10 hover:border-primary/30 rounded-2xl shadow-lg relative z-10 flex flex-col h-full group-hover:shadow-xl backdrop-blur-sm bg-white/5">
        
        {/* Product Image Section */}
        <Link to={`/products/${product.id}`} className="relative h-48 overflow-hidden rounded-t-2xl block">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80";
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
          
          {/* Capacity badge */}
          <div className="absolute top-3 right-3 bg-primary text-dark px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {capacity}
          </div>

          {/* Use case badge */}
          {product.useCase && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(product.useCase)}`}>
              {product.useCase}
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute bottom-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {discountPercent}% OFF
            </div>
          )}

          {/* Subsidy badge */}
          {subsidyAmount > 0 && (
            <div className="absolute bottom-3 right-3 bg-success text-white px-3 py-1 rounded-full text-xs font-semibold">
              ₹{subsidyAmount.toLocaleString()} Subsidy
            </div>
          )}
        </Link>

        {/* Product Info Section */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-light group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
              {product.name}
            </h3>            <p className="text-light/70 text-sm line-clamp-2 mb-3">
              {product.short_description || product.description}
            </p>
          </div>

          {/* Key specifications */}
          <div className="space-y-2 mb-4">
            {monthlySavings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-light/70">Monthly Savings</span>
                </div>
                <span className="font-semibold text-primary">₹{monthlySavings.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-light/70">Warranty</span>
              </div>
              <span className="font-semibold text-light">{warrantyYears} Years</span>
            </div>
          </div>

          {/* Price section */}
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-end gap-3 mb-2">
              <div className="flex items-center gap-1">
                <IndianRupee className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {salePrice.toLocaleString()}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-sm line-through text-light/50">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            
            {subsidyAmount > 0 && (
              <div className="text-xs text-success font-medium">
                Inclusive of ₹{subsidyAmount.toLocaleString()} government subsidy
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="mt-auto space-y-3">
            {/* Primary WhatsApp CTA */}            <a
              href={generateWhatsAppLink(product.name, capacity)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover active:bg-primary-active py-3 px-5 rounded-lg transition-all duration-300 group/btn"
            >
              <MessageCircle className="h-4 w-4 text-dark" />
              <span className="text-dark font-semibold text-base">
                Get Quote on WhatsApp
              </span>
            </a>

            {/* Secondary View Details CTA */}
            <Link 
              to={`/products/${product.id}`}
              className="flex items-center justify-center gap-2 w-full border border-white/20 text-light hover:border-primary/50 hover:bg-primary/5 py-2.5 px-5 rounded-lg transition-all duration-300 group/btn"
            >
              <span className="font-medium text-sm">View Details</span>
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}