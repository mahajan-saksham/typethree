// Enhanced Suggested Products Section for Home.tsx
// This replaces the existing suggested products section with improved logic

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sun, 
  Wallet, 
  Clock, 
  Zap,
  Shield,
  Loader,
  AlertCircle
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

// Enhanced Product Interface
interface SuggestedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity_kw: number;
  category: string;
  image_url?: string;
  monthly_savings?: number;
  subsidy_amount?: number;
  installation_time?: string;
  panel_type?: string;
  features?: string[];
}

// Enhanced fallback products with better data
const enhancedFallbackProducts: SuggestedProduct[] = [
  {
    id: "fallback-residential-3kw",
    name: "3kW Residential Solar System",
    description: "Perfect for medium-sized homes with 3-4 bedrooms. Includes high-efficiency monocrystalline panels and net metering capability.",
    price: 180000,
    capacity_kw: 3,
    category: "Residential",
    monthly_savings: 3500,
    subsidy_amount: 54000,
    installation_time: "4-5 days",
    panel_type: "Monocrystalline",
    image_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=160&fit=crop&auto=format",
    features: ["25-year warranty", "Net metering ready", "Smart monitoring"]
  },
  {
    id: "fallback-residential-5kw",
    name: "5kW Residential Solar System",
    description: "Ideal for large homes and small businesses. Maximizes roof space utilization with premium solar technology.",
    price: 280000,
    capacity_kw: 5,
    category: "Residential",
    monthly_savings: 5500,
    subsidy_amount: 84000,
    installation_time: "5-6 days",
    panel_type: "Monocrystalline",
    image_url: "https://images.unsplash.com/photo-1566055416285-a5fe2b7b5afe?w=400&h=160&fit=crop&auto=format",
    features: ["25-year warranty", "Net metering ready", "Mobile app monitoring"]
  },
  {
    id: "fallback-hybrid-3kw",
    name: "3kW Hybrid Solar System",
    description: "Grid-tied system with battery backup. Perfect for areas with frequent power cuts and load shedding.",
    price: 320000,
    capacity_kw: 3,
    category: "Hybrid",
    monthly_savings: 4200,
    subsidy_amount: 54000,
    installation_time: "6-7 days",
    panel_type: "Monocrystalline",
    image_url: "https://images.unsplash.com/photo-1509391269670-a91d29c6ecad?w=400&h=160&fit=crop&auto=format",
    features: ["Battery backup", "Grid-tie capability", "Smart inverter"]
  },
  {
    id: "fallback-offgrid-2kw",
    name: "2kW Off-Grid Solar System",
    description: "Complete standalone system for remote locations. Includes battery bank and charge controller for 24/7 power.",
    price: 200000,
    capacity_kw: 2,
    category: "Off-Grid",
    monthly_savings: 2800,
    subsidy_amount: 36000,
    installation_time: "4-5 days",
    panel_type: "Polycrystalline",
    image_url: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=160&fit=crop&auto=format",
    features: ["Complete independence", "Battery included", "Remote monitoring"]
  }
];

const SuggestedProductsSection: React.FC = () => {
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Smart product selection logic
  const selectBestProducts = (allProducts: SuggestedProduct[]): SuggestedProduct[] => {
    // Priority order for categories
    const categoryPriority = {
      'Residential': 5,
      'Solar Panels': 4,
      'Hybrid': 3,
      'Off-Grid': 2,
      'Accessories': 1
    };

    // Filter and score products
    const scoredProducts = allProducts
      .filter(product => {
        const name = product.name?.toLowerCase() || '';
        const category = product.category?.toLowerCase() || '';
        
        // Exclude very small systems and accessories we don't want to highlight
        return !(
          name.includes('light') ||
          name.includes('fence') ||
          name.includes('water heater') ||
          name.includes('water pump') ||
          category === 'accessories' ||
          (product.capacity_kw && product.capacity_kw < 1)
        );
      })
      .map(product => {
        let score = 0;
        
        // Category priority
        score += categoryPriority[product.category as keyof typeof categoryPriority] || 0;
        
        // Capacity sweet spot (2-5kW gets highest score)
        if (product.capacity_kw >= 2 && product.capacity_kw <= 5) {
          score += 3;
        } else if (product.capacity_kw >= 1 && product.capacity_kw < 2) {
          score += 2;
        } else if (product.capacity_kw > 5) {
          score += 1;
        }
        
        // Has subsidy (government incentive)
        if (product.subsidy_amount && product.subsidy_amount > 0) {
          score += 2;
        }
        
        // Has good monthly savings
        if (product.monthly_savings && product.monthly_savings > 2000) {
          score += 1;
        }
        
        // Has image
        if (product.image_url) {
          score += 1;
        }
        
        return { ...product, score };
      })
      .sort((a, b) => b.score - a.score); // Sort by score descending

    return scoredProducts.slice(0, 4); // Return top 4 products
  };

  // Fetch products from database
  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching suggested products from Supabase...");
        
        const { data, error: fetchError } = await supabase
          .from("product_skus")
          .select(`
            id,
            name,
            description,
            price,
            capacity_kw,
            category,
            image_url,
            monthly_savings,
            subsidy_amount,
            installation_time,
            panel_type,
            features
          `)
          .order("capacity_kw", { ascending: true });

        if (fetchError) {
          console.error("Database fetch error:", fetchError);
          throw new Error("Failed to fetch products from database");
        }

        if (data && data.length > 0) {
          // Transform and validate data
          const validProducts: SuggestedProduct[] = data.map(item => ({
            id: item.id || `product-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name || 'Solar System',
            description: item.description || `High-efficiency ${item.category || 'solar'} system for your energy needs`,
            price: Number(item.price) || 0,
            capacity_kw: Number(item.capacity_kw) || 0,
            category: item.category || 'Solar',
            image_url: item.image_url || undefined,
            monthly_savings: item.monthly_savings || undefined,
            subsidy_amount: item.subsidy_amount || undefined,
            installation_time: item.installation_time || "4-5 days",
            panel_type: item.panel_type || "Monocrystalline",
            features: Array.isArray(item.features) ? item.features : []
          }));

          const bestProducts = selectBestProducts(validProducts);
          
          // If we don't have enough good products, supplement with fallbacks
          if (bestProducts.length < 4) {
            const needed = 4 - bestProducts.length;
            const supplementalProducts = enhancedFallbackProducts.slice(0, needed);
            setProducts([...bestProducts, ...supplementalProducts]);
          } else {
            setProducts(bestProducts);
          }
          
          console.log(`Loaded ${bestProducts.length} suggested products`);
        } else {
          console.warn("No products found in database, using fallback products");
          setProducts(enhancedFallbackProducts);
        }
      } catch (err) {
        console.error("Error fetching suggested products:", err);
        setError("Failed to load products");
        setProducts(enhancedFallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-dark" id="suggested-products">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-light mb-2">
              Suggested <span className="text-primary">Products</span>
            </h2>
            <p className="text-light/60">Tailored solutions for your solar energy needs</p>
          </div>
          
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-light/60">
              <Loader className="h-5 w-5 animate-spin" />
              <span>Loading products...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state (still show fallback products)
  if (error && products.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-dark" id="suggested-products">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-light mb-2">
              Suggested <span className="text-primary">Products</span>
            </h2>
            <p className="text-light/60">Tailored solutions for your solar energy needs</p>
          </div>
          
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-orange-400">
              <AlertCircle className="h-5 w-5" />
              <span>Unable to load products. Please try again later.</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-dark" id="suggested-products">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-light mb-2">
              Suggested <span className="text-primary">Products</span>
            </h2>
            <p className="text-light/60">Tailored solutions for your solar energy needs</p>
            {error && (
              <p className="text-orange-400/80 text-sm mt-2">
                Showing featured products (database connection restored)
              </p>
            )}
          </motion.div>
        </div>
        
        {/* Enhanced Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full"
            >
              <Link 
                to={`/products/${product.id}`} 
                className="group h-full flex flex-col bg-dark-800/50 rounded-xl overflow-hidden border border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Enhanced Product Image */}
                <div className="relative h-[160px] overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        // Fallback to a default solar panel image
                        currentTarget.src = "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=160&fit=crop&auto=format";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Sun className="h-16 w-16 text-primary/60" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/70"></div>
                  
                  {/* Capacity Badge */}
                  <div className="absolute top-3 right-3 bg-primary text-dark px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    {product.capacity_kw}kW
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-dark/80 text-light px-2 py-1 rounded text-xs font-medium">
                    {product.category}
                  </div>
                </div>
                
                {/* Enhanced Product Info */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Product Name */}
                  <h3 className="text-lg font-bold mb-2 text-light group-hover:text-primary transition-colors duration-300 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-light/60 mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Key Features */}
                  <div className="space-y-2.5 mb-4">
                    {/* Annual Generation */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                        <Zap size={12} className="text-primary" />
                      </div>
                      <div className="flex flex-1 justify-between">
                        <span className="text-xs text-light/70">Annual Generation</span>
                        <span className="text-xs font-semibold text-light">
                          {(product.capacity_kw * 1400).toLocaleString()} kWh
                        </span>
                      </div>
                    </div>
                    
                    {/* Monthly Savings */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                        <Wallet size={12} className="text-primary" />
                      </div>
                      <div className="flex flex-1 justify-between">
                        <span className="text-xs text-light/70">Monthly Savings</span>
                        <span className="text-xs font-semibold text-light">
                          {product.monthly_savings ? `₹${product.monthly_savings.toLocaleString()}` : '₹2,500+'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Installation Time */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                        <Clock size={12} className="text-primary" />
                      </div>
                      <div className="flex flex-1 justify-between">
                        <span className="text-xs text-light/70">Installation</span>
                        <span className="text-xs font-semibold text-light">
                          {product.installation_time}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Price Section */}
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-end gap-2 mb-3">
                      {product.subsidy_amount && product.subsidy_amount > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xs line-through text-light/40">
                            ₹{product.price.toLocaleString()}
                          </span>
                          <span className="text-xl font-bold text-primary">
                            ₹{(product.price - product.subsidy_amount).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-primary">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                      
                      {product.subsidy_amount && product.subsidy_amount > 0 && (
                        <span className="text-xs bg-success/20 text-success px-2 py-1 rounded font-medium">
                          Save ₹{product.subsidy_amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Enhanced CTA Button */}
                    <button className="flex items-center justify-between w-full bg-primary hover:bg-primary-hover active:bg-primary-active py-3 px-4 rounded-lg transition-all duration-300 group-hover:shadow-lg">
                      <span className="text-dark font-medium text-sm">View Details</span>
                      <ArrowRight className="h-4 w-4 text-dark transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* Call to Action */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-dark px-8 py-3 rounded-lg font-medium transition-all duration-300"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default SuggestedProductsSection;
