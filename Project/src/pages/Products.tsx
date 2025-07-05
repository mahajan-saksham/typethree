import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sun, 
  Battery, 
  Shield,
  SlidersHorizontal,
  Search,
  ChevronDown,
  HomeIcon,
  Zap,
  IndianRupee,
  Clock,
  CheckCircle2,
  ArrowRight,
  X,
  ArrowUpRight,
  StarIcon,
  Power,
  CircuitBoard,
  Fence,
  Lightbulb,
  Droplet,
  PanelTop,
  Blocks,
  Wrench,
  Wallet
} from 'lucide-react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { supabase } from '../lib/supabaseClient';
import { SiteVisitForm } from '../components/SiteVisitForm';

interface Product {
  id: string;
  name: string;
  capacity_kw: number;
  generation: string;
  area_required: number;
  monthly_savings: number;
  subsidy_amount: number;
  price: number;
  panel_type: string;
  image_url: string;
  features: string[];
  description: string;
  category: string;
  sku: string;
  original_price?: number;
  installation_time?: string;
  specifications?: Record<string, any>;
  inventory_count?: number;
}

interface Filters {
  capacity: [number, number];
  price: [number, number];
  panelType: 'all' | 'monocrystalline' | 'polycrystalline';
  area: [number, number];
}

type SortOption = 'price-asc' | 'price-desc' | 'capacity-asc' | 'capacity-desc';
type CategoryFilter = 'on-grid' | 'off-grid' | 'hybrid' | 'fencing' | 'lighting' | 'water_heating' | 'water_pumping' | 'rock_lighting';

export default function Products() {
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [siteVisitProduct, setSiteVisitProduct] = useState<{sku: string, name: string, power: number} | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    capacity: [0, 20],
    price: [0, 1000000],
    panelType: 'all',
    area: [0, 2000]
  });
  const [sortBy, setSortBy] = useState<SortOption>('capacity-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // selectedProduct state removed - now using standalone ProductDetail page
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('on-grid');
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('product_skus')
          .select('*')
          .order('capacity_kw', { ascending: true });
        
        if (error) throw error;
        
        const transformedProducts = data.map((product: any) => ({
          ...product,
          features: Array.isArray(product.features) 
            ? product.features 
            : (typeof product.features === 'string' 
                ? JSON.parse(product.features) 
                : product.features || []),
          specifications: typeof product.specifications === 'string' 
            ? JSON.parse(product.specifications) 
            : product.specifications || {}
        }));
        
        setProducts(transformedProducts);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Error fetching products');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = products.filter(product => {
    // Only apply basic validation for required fields
    if (!product || !product.name) {
      return false;
    }

    // Only apply search filter if search is active
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Only category should be a hard filter, everything else is optional
    const matchesCategory = product.category === selectedCategory;

    // Everything else passes by default - we'll show all products
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'capacity-asc':
        return a.capacity_kw - b.capacity_kw;
      case 'capacity-desc':
        return b.capacity_kw - a.capacity_kw;
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // handleProductSelect function removed - now using direct Link navigation to ProductDetail page

  const handleBookClick = (product: Product) => {
    setSiteVisitProduct({
      sku: product.sku,
      name: product.name,
      power: product.capacity_kw
    });
    setIsSiteVisitModalOpen(true);
  };

  const handleCloseSiteVisit = () => {
    setIsSiteVisitModalOpen(false);
    setSiteVisitProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      
      {/* Category Navigation - Apple Style */}
      <motion.section 
        className={`sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300 mt-20 ${isScrolled ? 'py-3' : 'py-6'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 max-w-6xl overflow-hidden">
          <div className="relative">
            {/* Scrollable container with custom scrollbar */}
            <div className="overflow-x-auto lg:overflow-visible hide-scrollbar pb-4">
              <div className="flex gap-2 md:gap-3 px-4 py-2 min-w-max lg:min-w-0 flex-nowrap lg:flex-wrap lg:justify-center lg:max-w-5xl mx-auto">
                {[
                  { id: 'on-grid', name: 'On-Grid Systems', icon: <Zap size={24} /> },
                  { id: 'off-grid', name: 'Off-Grid Systems', icon: <Power size={24} /> },
                  { id: 'hybrid', name: 'Hybrid Systems', icon: <CircuitBoard size={24} /> },
                  { id: 'fencing', name: 'Fencing Systems', icon: <Fence size={24} /> },
                  { id: 'lighting', name: 'Street Lights', icon: <Lightbulb size={24} /> },
                  { id: 'water_heating', name: 'Water Heaters', icon: <Droplet size={24} /> },
                  { id: 'water_pumping', name: 'Water Pumps', icon: <PanelTop size={24} /> },
                  { id: 'rock_lighting', name: 'Rock Lights', icon: <Blocks size={24} /> }
                ].map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id as CategoryFilter)}
                    className={`flex flex-col items-center justify-center w-24 h-24 sm:w-[100px] sm:h-[100px] rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedCategory === category.id 
                        ? 'bg-primary text-dark border-2 border-primary' 
                        : 'bg-dark-900/50 text-light/80 border border-white/10 hover:border-primary/30'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full mb-1.5 ${
                      selectedCategory === category.id 
                        ? 'bg-dark/10' 
                        : 'bg-primary/10'
                    }`}>
                      <span className={selectedCategory === category.id ? 'text-dark' : 'text-primary'}>
                        {React.cloneElement(category.icon as React.ReactElement, {size: 20})}
                      </span>
                    </div>
                    <span className="text-center text-xs sm:text-sm font-medium px-2 leading-tight">{category.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Fade effect on edges */}
            {/* Left gradient removed */}
            <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-dark to-transparent pointer-events-none"></div>
          </div>
        </div>
      </motion.section>
      
      {/* Products Grid - Apple Style */}
      <section className="pt-10 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Enhanced Section Heading with Illustration */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Clean card with minimal styling inspired by Home page */}
            <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md p-6 md:p-8 relative z-10 w-full max-w-5xl mx-auto bg-dark-900/50 backdrop-blur-sm group hover:shadow-xl hover:shadow-primary/5">
              {/* Subtle background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-xl"></div>
              
              {/* Content Section */}
              <div className="space-y-4 relative z-10 text-left">
                {/* Title and description */}
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                    {selectedCategory === 'all' ? 'All Products' : 
                     `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}${['panels', 'inverters', 'batteries', 'mounting', 'accessories', 'packages'].includes(selectedCategory) ? '' : ' Systems'}`}
                  </h2>
                  <p className="text-light/70">
                    {selectedCategory === 'all' 
                      ? 'Browse our complete collection of premium solar systems tailored for various needs.'
                      : selectedCategory === 'on-grid'
                        ? 'Specially designed for homes, maximizing energy production with minimal roof space.'
                        : selectedCategory === 'off-grid'
                          ? 'High-capacity systems for businesses looking to reduce operational costs.'
                          : selectedCategory === 'hybrid'
                            ? 'Industrial-grade solar systems for large-scale facilities and manufacturing plants.'
                            : selectedCategory === 'fencing'
                              ? 'Specially designed for homes, maximizing energy production with minimal roof space.'
                              : selectedCategory === 'lighting'
                                ? 'High-capacity systems for businesses looking to reduce operational costs.'
                                : selectedCategory === 'water_heating'
                                  ? 'Industrial-grade solar systems for large-scale facilities and manufacturing plants.'
                                  : selectedCategory === 'water_pumping'
                                    ? 'Specially designed for homes, maximizing energy production with minimal roof space.'
                                    : 'High-capacity systems for businesses looking to reduce operational costs.'}
                  </p>
                </div>
                
                {/* Key features as horizontal tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategory === 'on-grid' && (
                    <>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        Grid-tied
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        No batteries
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        Net metering
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 border border-primary/20 text-light">
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary mr-1.5" />
                        40% subsidy
                      </span>
                    </>
                  )}
                  {selectedCategory === 'off-grid' && (
                    <>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        Independent
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        Battery backup
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        Remote areas
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 border border-primary/20 text-light">
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary mr-1.5" />
                        25% subsidy
                      </span>
                    </>
                  )}
                  {selectedCategory === 'hybrid' && (
                    <>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        Grid + Battery
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        Power backup
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-light/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1.5" />
                        Smart control
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 border border-primary/20 text-light">
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary mr-1.5" />
                        30% subsidy
                      </span>
                    </>
                  )}
                  {/* Additional categories would follow the same pattern */}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Apple-style Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-20 max-w-5xl mx-auto">
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Link 
                  to={`/products/${product.id}`}
                  className="group h-full flex flex-col bg-dark-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5" 
                >
                  {/* Product Image - Larger, Apple-style */}
                  <div className="relative h-[150px] md:h-[300px] overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/80"></div>
                    <div className="absolute top-4 right-4 bg-dark-900/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium border border-white/10">
                      {product.capacity_kw} kW
                    </div>
                  </div>
                  
                  {/* Product Info - Clean, Minimal */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-[1.15rem] font-bold mb-4 text-light group-hover:text-primary transition-colors duration-300">
                        {product.name}
                      </h3>

                      
                      {/* Key Specs - Apple Style Line Design */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                          <Sun size={16} className="text-primary/80" />
                          <div className="flex flex-1 justify-between">
                            <span className="text-light/80 text-sm">Annual Energy</span>
                            <span className="text-sm font-medium">{product.capacity_kw * 1400} kWh</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wallet size={16} className="text-primary/80" />
                          <div className="flex flex-1 justify-between">
                            <span className="text-light/80 text-sm">Annual Savings</span>
                            <span className="text-sm font-medium">₹{product.monthly_savings * 12}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary/80" />
                          <div className="flex flex-1 justify-between">
                            <span className="text-light/80 text-sm">Payback Period</span>
                            <span className="text-sm font-medium">{Math.round(product.price / (product.monthly_savings * 12))} years</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-primary/80" />
                          <div className="flex flex-1 justify-between">
                            <span className="text-light/80 text-sm">Installation</span>
                            <span className="text-sm font-medium">{product.installation_time || '7-10'} days</span>
                          </div>
                        </div>
                        {product.price > 20000 && (
                          <div className="mt-4 flex items-center gap-2">
                            <Wallet size={16} className="text-primary/80" />
                            <div className="flex flex-1 justify-between">
                              <span className="text-light/80 text-sm">Easy EMI</span>
                              <span className="text-sm font-medium">
                                ₹{Math.round((product.price - (product.subsidy_amount || 0)) / 12).toLocaleString()}/month
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <p className="text-base line-through text-light/40">₹{product.price.toLocaleString()}</p>
                          <span className="text-xs font-medium text-primary">
                            {Math.round((product.subsidy_amount / product.price) * 100)}% off
                          </span>
                        </div>
                        <p className="text-2xl font-medium text-light">
                          ₹{(product.price - (product.subsidy_amount || 0)).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click event from firing
                          handleBookClick(product);
                        }}
                        variant="primary"
                        size="md"
                        radius="full"
                      >
                        Book
                        <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl text-light/60"
              >
                No products match your current filters.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-primary hover:text-primary/80 underline"
                onClick={() => {
                  setFilters({
                    capacity: [0, 20],
                    price: [0, 1000000],
                    panelType: 'all',
                    area: [0, 2000]
                  });
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </motion.button>
            </div>
          )}
        </div>
      </section>
      
      {/* Product Details Modal - Apple Style */}
      {/* Product details modal removed - now using standalone ProductDetail page */}
      {/* Site Visit Modal */}
      <AnimatePresence>
        {isSiteVisitModalOpen && siteVisitProduct && (
          <SiteVisitForm
            isOpen={isSiteVisitModalOpen}
            onClose={handleCloseSiteVisit}
            productSku={siteVisitProduct.sku}
            productName={siteVisitProduct.name}
            productPower={siteVisitProduct.power}
            price={products.find(p => p.sku === siteVisitProduct.sku)?.price || 0}
            installationTime={products.find(p => p.sku === siteVisitProduct.sku)?.installation_time || '7-10'}
            imageUrl={products.find(p => p.sku === siteVisitProduct.sku)?.image_url}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
