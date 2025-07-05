import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid3X3, List, ArrowRight, Zap, MessageCircle, Sun, Droplets, Lightbulb, ShieldCheck } from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { ProductGridSkeleton } from '../components/products/ProductSkeleton';
import { products as staticProducts, ProductTypes } from '../data/products';
import { supabase } from '../lib/supabaseClient';

const Products: React.FC = () => {
  const [products, setProducts] = useState(staticProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    category: '',
    productType: '',
    sortBy: 'name',
    hasSubsidy: undefined as boolean | undefined,
    priceRange: '',
    capacity: ''
  });
  
  const [page, setPage] = useState(1);
  const limit = 12;
  const [viewMode, setViewMode] = useState('grid');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        if (import.meta.env.MODE !== 'development') {
          const { data, error } = await supabase
            .from('product_skus')
            .select(`*, product_categories(name, icon_name)`)
            .order('name');
            
          if (error) throw error;
          if (data && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts(staticProducts);
        setError('Using offline product catalog.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const applyFilters = () => {
    let filtered = [...products];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by product type
    if (filters.productType) {
      filtered = filtered.filter(product => 
        product.product_type === filters.productType
      );
    }
    
    // Filter by category/use case
    if (filters.category) {
      filtered = filtered.filter(product => 
        (product.category && product.category.toLowerCase() === filters.category.toLowerCase()) ||
        (product.useCase && product.useCase.toLowerCase() === filters.category.toLowerCase())
      );
    }
    
    // Filter by subsidy
    if (filters.hasSubsidy !== undefined) {
      filtered = filtered.filter(product => 
        product.hasSubsidy === filters.hasSubsidy
      );
    }
    
    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.sale_price || product.price || 0;
        switch(filters.priceRange) {
          case '0-50000': return price < 50000;
          case '50000-100000': return price >= 50000 && price < 100000;
          case '100000-200000': return price >= 100000 && price < 200000;
          case '200000+': return price >= 200000;
          default: return true;
        }
      });
    }
    
    // Filter by capacity
    if (filters.capacity) {
      filtered = filtered.filter(product => 
        product.capacity === parseInt(filters.capacity)
      );
    }
    
    // Sort products
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => {
          const priceA = a.sale_price || a.price || 0;
          const priceB = b.sale_price || b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        filtered.sort((a, b) => {
          const priceA = a.sale_price || a.price || 0;
          const priceB = b.sale_price || b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'savings':
        filtered.sort((a, b) => (b.monthly_savings || 0) - (a.monthly_savings || 0));
        break;
      default:
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      products: filtered.slice(startIndex, endIndex),
      total: filtered.length
    };
  };
  
  const filteredData = applyFilters();
  const filteredProducts = filteredData.products;
  const totalProducts = filteredData.total;
  const totalPages = Math.ceil(totalProducts / limit);
  
  const handleFilterChange = (name: string, value: any) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProductTypeFilter = (type: string) => {
    handleFilterChange('productType', type === filters.productType ? '' : type);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Product type icons
  const productTypeIcons: Record<string, any> = {
    'on-grid': Sun,
    'off-grid': ShieldCheck,
    'hybrid': Zap,
    'water-heater': Droplets,
    'street-light': Lightbulb,
  };
  
  return (
    <div className="min-h-screen bg-dark">
      {/* Enhanced Header Section */}
      <section className="relative py-6 sm:py-8 border-b border-white/10 mt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50" />
        
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-bold text-light mb-4"
            >
              Solar Products
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-light/70 max-w-2xl mx-auto"
            >
              Discover our range of high-efficiency solar solutions designed for Indian homes and businesses
            </motion.p>
            
            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-8 mt-6"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalProducts}</p>
                <p className="text-sm text-light/60">Products</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">40%</p>
                <p className="text-sm text-light/60">Govt. Subsidy</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">25 Years</p>
                <p className="text-sm text-light/60">Warranty</p>
              </div>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light/50" />
              <input
                type="text"
                placeholder="Search products by name, type, or capacity..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-light placeholder-light/50 focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
              />
            </div>
          </div>

          {/* Product Type Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-light/70">Filter by Type</h3>
              
              {/* Mobile Filter Toggle */}
              <button 
                className="md:hidden flex items-center gap-2 text-sm text-light/70 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors"
                onClick={() => {
                  const filterContainer = document.getElementById('product-type-filters');
                  if (filterContainer) {
                    filterContainer.classList.toggle('hidden');
                    filterContainer.classList.toggle('flex');
                  }
                }}
              >
                <span>Filters</span>
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div id="product-type-filters" className="flex md:flex-wrap gap-2 sm:gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleProductTypeFilter('')}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 flex-shrink-0 ${
                  filters.productType === ''
                    ? 'bg-gradient-to-r from-primary to-primary-hover text-dark shadow-lg shadow-primary/30'
                    : 'bg-white/10 text-light hover:bg-white/20 border border-white/20'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                All Products
              </motion.button>
              
              {Object.entries(ProductTypes).slice(0, 5).map(([key, label]) => {
                const Icon = productTypeIcons[key];
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleProductTypeFilter(key)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 flex-shrink-0 ${
                      filters.productType === key
                        ? 'bg-gradient-to-r from-primary to-primary-hover text-dark shadow-lg shadow-primary/30'
                        : 'bg-white/10 text-light hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    <span className="line-clamp-1">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Advanced Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left side - Additional filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="bg-white/10 border border-white/20 text-light rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none hover:bg-white/15 transition-colors"
              >
                <option value="name">Sort by Name</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="savings">Monthly Savings</option>
              </select>

              {/* Price Range Filter */}
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="bg-white/10 border border-white/20 text-light rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none hover:bg-white/15 transition-colors"
              >
                <option value="">All Prices</option>
                <option value="0-50000">Under ₹50,000</option>
                <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                <option value="100000-200000">₹1,00,000 - ₹2,00,000</option>
                <option value="200000+">Above ₹2,00,000</option>
              </select>

              {/* Capacity Filter */}
              <select
                value={filters.capacity}
                onChange={(e) => handleFilterChange('capacity', e.target.value)}
                className="bg-white/10 border border-white/20 text-light rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none hover:bg-white/15 transition-colors"
              >
                <option value="">All Capacities</option>
                <option value="1">1 kW</option>
                <option value="2">2 kW</option>
                <option value="3">3 kW</option>
                <option value="5">5 kW</option>
                <option value="10">10 kW</option>
              </select>
            </div>
            
            {/* Right side - View mode */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-light/60 hidden sm:inline">View:</span>
              <div className="flex items-center bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-primary text-dark' : 'text-light hover:bg-white/10'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-primary text-dark' : 'text-light hover:bg-white/10'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-white/10 px-3 py-2 rounded-lg transition-all hover:bg-white/15">
              <input
                type="checkbox"
                checked={filters.hasSubsidy || false}
                onChange={(e) => handleFilterChange('hasSubsidy', e.target.checked ? true : undefined)}
                className="w-4 h-4 text-primary bg-transparent border-2 border-white/30 rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-light/80 text-sm">Subsidized products only</span>
            </label>
            
            {/* Show active filters as removable chips */}
            {filters.productType && (
              <div className="flex items-center gap-2 bg-primary/20 px-3 py-2 rounded-lg">
                <span className="text-sm text-primary">Type: {ProductTypes[filters.productType]}</span>
                <button 
                  onClick={() => handleFilterChange('productType', '')}
                  className="text-primary hover:text-primary-hover"
                >
                  ×
                </button>
              </div>
            )}
            {filters.priceRange && (
              <div className="flex items-center gap-2 bg-primary/20 px-3 py-2 rounded-lg">
                <span className="text-sm text-primary">Price: {filters.priceRange}</span>
                <button 
                  onClick={() => handleFilterChange('priceRange', '')}
                  className="text-primary hover:text-primary-hover"
                >
                  ×
                </button>
              </div>
            )}
            {searchQuery && (
              <div className="flex items-center gap-2 bg-primary/20 px-3 py-2 rounded-lg">
                <span className="text-sm text-primary">Search: "{searchQuery}"</span>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-primary hover:text-primary-hover"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          {error && (
            <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-200">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <ProductGridSkeleton count={limit} />
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-light/30" />
                  </div>
                  <h3 className="text-xl font-semibold text-light mb-2">No products found</h3>
                  <p className="text-light/60 mb-6">Try adjusting your filters to see more results</p>
                  <button
                    onClick={() => {
                      setFilters({ category: '', productType: '', sortBy: 'name', hasSubsidy: undefined, priceRange: '', capacity: '' });
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="px-6 py-3 bg-primary text-dark rounded-lg font-medium hover:bg-primary-hover transition-colors duration-300"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                layout
                className={`grid gap-8 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1 max-w-4xl mx-auto'
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="py-8 border-t border-white/10">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex justify-center">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    page === 1
                      ? 'bg-white/5 text-light/30 cursor-not-allowed'
                      : 'bg-white/10 text-light hover:bg-white/20 hover:text-primary'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(1, page - 2);
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 ${
                        pageNum === page
                          ? 'bg-primary text-dark'
                          : 'bg-white/10 text-light hover:bg-white/20 hover:text-primary'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    page === totalPages
                      ? 'bg-white/5 text-light/30 cursor-not-allowed'
                      : 'bg-white/10 text-light hover:bg-white/20 hover:text-primary'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 border-t border-white/10">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-light mb-4">
              Can't find the perfect solution?
            </h2>
            <p className="text-light/70 mb-8 max-w-2xl mx-auto">
              Our solar experts can design a custom solution tailored to your specific needs and budget.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/918095508066?text=Hi%20Team%20Type3,%20I%20need%20a%20custom%20solar%20solution%20for%20my%20property."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-dark rounded-lg font-semibold hover:bg-primary-hover transition-all duration-300"
              >
                <MessageCircle className="h-5 w-5" />
                Get Custom Quote
                <ArrowRight className="h-5 w-5" />
              </a>
              
              <button className="flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-light rounded-lg font-medium hover:bg-white/5 transition-all duration-300">
                Schedule Site Visit
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Products;