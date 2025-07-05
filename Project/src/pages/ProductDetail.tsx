import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { SiteVisitForm } from '../components/SiteVisitForm';
import { Button } from '../components/Button';
import { 
  Sun, Battery, Shield, ArrowRight, ArrowLeft,
  IndianRupee, Clock, CheckCircle2, Power,
  CircuitBoard, Zap, HomeIcon, X
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  capacity_kw: number;
  generation: string;
  area_required: number;
  monthly_savings: number;
  price: number;
  subsidy_amount?: number;
  sku: string;
  panel_type: string;
  installation_time: string;
  power: number;
  image_url?: string;
  description?: string;
}

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        console.log('Fetching product with ID:', productId);
      
        if (productId) {
          const { data, error } = await supabase
            .from('product_skus')
            .select('*')
            .eq('id', productId)
            .single();
            
          console.log('Supabase response:', { data, error });  
            
          if (data) {
            console.log('Product data found:', data);
            setProduct(data);
          } else if (error) {
            console.error('Error fetching product:', error);
          } else {
            console.warn('No product found and no error returned');
          }
        } else {
          console.warn('No productId provided in URL params');
        }
      } catch (err) {
        console.error('Exception in fetchProduct:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [productId]);
  
  const handleBookClick = () => {
    setIsSiteVisitModalOpen(true);
  };
  
  const handleCloseSiteVisit = () => {
    setIsSiteVisitModalOpen(false);
  };
  
  // SEO Optimization
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Type 3 Solar`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          'content', 
          `${product.capacity_kw}kW ${product.name} - ${product.description?.substring(0, 150) || 'High-efficiency solar system'}`
        );
      }
    } else {
      document.title = 'Solar Product | Type 3 Solar';
    }
    
    return () => {
      document.title = 'Type 3 Solar | Clean Energy Solutions';
    };
  }, [product]);
  
  if (loading) return (
    <div className="container mx-auto py-20 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
      <p className="text-light mt-4">Loading product details...</p>
    </div>
  );
  
  if (!product) return (
    <div className="container mx-auto py-20 text-center">
      <h2 className="text-2xl font-bold text-light mb-4">Product not found</h2>
      <Link to="/products" className="text-primary hover:underline">
        Browse all products
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section with Background Image */}
      <div className="relative h-[50vh] sm:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img 
          src={product.image_url || 'https://via.placeholder.com/1920x1080?text=No+Image'} 
          alt={product.name}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent z-10"></div>
        
        {/* Navigation and Title Overlay */}
        <div className="container mx-auto absolute inset-0 z-20 flex flex-col justify-end pb-12 px-4">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 text-light/80">
            <ol className="flex flex-wrap items-center">
              <li className="flex items-center">
                <Link to="/" className="hover:text-primary transition-colors duration-300">
                  <HomeIcon size={16} />
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li className="flex items-center">
                <Link to="/products" className="hover:text-primary transition-colors duration-300">
                  Products
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li className="text-light truncate max-w-[200px] sm:max-w-xs">
                {product.name}
              </li>
            </ol>
          </nav>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">{product.name}</h1>
          <p className="text-xl text-light/90 max-w-2xl drop-shadow-md">{product.description || `Complete ${product.capacity_kw} kW solar system for residential use with high efficiency panels.`}</p>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-2 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              
              {/* Product Specs Grid */}
              <div className="bg-dark-900/30 backdrop-blur-sm p-8 rounded-xl border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-6">System Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Zap size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-light/80 text-sm mb-1">Capacity</p>
                      <p className="text-xl font-medium text-white">{product.capacity_kw} kW</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Sun size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-light/80 text-sm mb-1">Generation</p>
                      <p className="text-xl font-medium text-white">{product.generation || '1st Generation'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <HomeIcon size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-light/80 text-sm mb-1">Area Required</p>
                      <p className="text-xl font-medium text-white">{product.area_required || 100} sq.ft</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <IndianRupee size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-light/80 text-sm mb-1">Monthly Savings</p>
                      <p className="text-xl font-medium text-white">₹{product.monthly_savings?.toLocaleString() || '1,250'}/mo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <CircuitBoard size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-light/80 text-sm mb-1">Panel Type</p>
                      <p className="text-xl font-medium text-white">{product.panel_type || 'monocrystalline'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Clock size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-light/80 text-sm mb-1">Installation</p>
                      <p className="text-xl font-medium text-white">{product.installation_time || '1-2'} days</p>
                    </div>
                  </div>
                </div>
                
                {/* Price and CTA */}
                <div className="mt-auto pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg line-through text-light/40">₹{product.price.toLocaleString()}</p>
                      <span className="text-sm font-medium text-primary">
                        {Math.round((product.subsidy_amount || 0) / product.price * 100)}% off
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-light">
                      ₹{(product.price - (product.subsidy_amount || 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-light/60">Price after government subsidy</p>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    size="md" 
                    radius="lg" 
                    onClick={handleBookClick}
                    className="w-full md:w-auto py-3 px-6 md:min-w-[170px]"
                  >
                    <span className="relative z-10 flex items-center justify-between w-full">
                      <span className="text-dark font-medium" style={{ textTransform: 'none', letterSpacing: '-0.02em' }}>Book Site Visit</span>
                      <Clock className="h-5 w-5 text-dark" />
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* ROI Estimator Section */}
      <div className="container mx-auto px-4 py-12 bg-dark-900/20 border-t border-b border-white/5">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Return on Investment</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-dark-900/30 backdrop-blur-sm p-6 rounded-xl border border-white/5 text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <IndianRupee size={28} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Monthly Savings</h3>
            <p className="text-3xl font-bold text-primary">₹{product.monthly_savings?.toLocaleString() || '1,250'}</p>
          </div>
          
          <div className="bg-dark-900/30 backdrop-blur-sm p-6 rounded-xl border border-white/5 text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Payback Period</h3>
            <p className="text-3xl font-bold text-primary">{Math.round(((product.price || 45000) - (product.subsidy_amount || 30000)) / (product.monthly_savings || 1250) / 12)} years</p>
          </div>
          
          <div className="bg-dark-900/30 backdrop-blur-sm p-6 rounded-xl border border-white/5 text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Sun size={28} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">25-Year Savings</h3>
            <p className="text-3xl font-bold text-primary">₹{((product.monthly_savings || 1250) * 12 * 25).toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Site Visit Modal */}
      {isSiteVisitModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-dark-900/90 backdrop-blur-xl rounded-2xl max-w-2xl w-full overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-light">Book a Site Visit</h3>
                <button 
                  onClick={handleCloseSiteVisit}
                  className="p-2 text-light/60 hover:text-primary transition-colors duration-300"
                >
                  <X size={24} />
                </button>
              </div>
              
              <SiteVisitForm
                isOpen={isSiteVisitModalOpen}
                onClose={handleCloseSiteVisit}
                productSku={product.sku}
                productName={product.name}
                productPower={product.capacity_kw}
                price={(product.price || 0) - (product.subsidy_amount || 0)}
                installationTime={product.installation_time || '7-10 days'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
