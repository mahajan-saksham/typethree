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
      whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
      className="group h-full"
    >
      <div className="h-full bg-dark-100/60 rounded-xl overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:shadow-black/20 flex flex-col">
        
        {/* Product Image */}
        <Link to={`/products/${product.id}`} className="relative block">
          <div className="aspect-[5/4] relative overflow-hidden bg-dark-200">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80";
              }}
            />
            
            {/* Minimal overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Discount badge - top left */}
            {hasDiscount && (
              <div className="absolute top-3 left-3">
                <div className="bg-error text-white px-2.5 py-1 rounded-md text-xs font-bold">
                  -{discountPercent}%
                </div>
              </div>
            )}

            {/* Category badge - top right */}
            <div className="absolute top-3 right-3">
              <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(useCase)}`}>
                {useCase}
              </span>
            </div>
          </div>
        </Link>

        {/* Content - Consistent 16px padding */}
        <div className="flex-1 p-4 flex flex-col">
          
          {/* Product name and description */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white leading-tight mb-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
              {product.short_description || product.description || 'High-efficiency solar solution'}
            </p>
          </div>

          {/* Key metrics - clean grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Monthly Savings</div>
              <div className="text-base font-bold text-success">
                ₹{monthlySavings > 0 ? monthlySavings.toLocaleString() : '2,500+'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Warranty</div>
              <div className="text-base font-bold text-white">{warrantyYears} Years</div>
            </div>
          </div>

          {/* Price section - clean and simple */}
          <div className="mb-4">
            {hasDiscount && (
              <div className="text-sm text-gray-500 line-through mb-1">
                ₹{originalPrice.toLocaleString()}
              </div>
            )}
            <div className="text-2xl font-bold text-white mb-1">
              ₹{salePrice.toLocaleString()}
            </div>
            {subsidyAmount > 0 && (
              <div className="text-xs text-success">
                Includes ₹{subsidyAmount.toLocaleString()} govt. subsidy
              </div>
            )}
          </div>

          {/* CTA buttons - clean and consistent */}
          <div className="mt-auto">
            <div className="grid grid-cols-2 gap-2">
              {/* Primary CTA */}
              <a
                href={generateWhatsAppLink(product.name, capacity)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-hover text-dark font-bold text-sm py-2.5 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Get Quote</span>
              </a>

              {/* Secondary CTA */}
              <Link 
                to={`/products/${product.id}`}
                className="border border-white/20 hover:border-white/30 text-gray-300 hover:text-white font-semibold text-sm py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 hover:bg-white/5"
              >
                <span>Details</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}