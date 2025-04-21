import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
// import CountUp from 'react-countup';
import { 
  ArrowRight, 
  Battery, 
  BarChart3,
  Home as HomeIcon,
  Sun,
  Zap,
  IndianRupee,
  Shield,
  Users,
  Car,
  CheckCircle2,
  Clock,
  Sparkles,
  Lightbulb,
  Droplets,
  Flame,
  Mountain,
  Leaf
} from 'lucide-react';

import { SiteVisitForm } from '../components/SiteVisitForm';
import { Button } from '../components/Button';
import { ImageCarousel } from '../components/ImageCarousel';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Types for products
interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  capacity_kw: number; 
  price: number;
  image_url: string;
  description: string;
  warranty_years: number;
  installation_days: number;
  subsidy_amount: number;
}

// Fallback product data in case database is empty
const fallbackProducts: Product[] = [
  {
    id: 'fallback-1',
    sku: 'APN-OFFGRID-1KW',
    name: '1kW Off-Grid Solar System',
    category: 'off-grid',
    capacity_kw: 1,
    price: 42000,
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/1kW%20off-grid%20solar%20system.png',
    description: 'Complete 1kW off-grid solar system for homes and small offices',
    warranty_years: 25,
    installation_days: 3,
    subsidy_amount: 15600
  },
  {
    id: 'fallback-3',
    sku: 'APN-OFFGRID-3KW',
    name: '3kW Off-Grid Solar System',
    category: 'off-grid',
    capacity_kw: 3,
    price: 126000,
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/3kW%20off-grid%20solar%20system.png',
    description: 'Complete 3kW off-grid solar system for medium-sized homes',
    warranty_years: 25,
    installation_days: 4,
    subsidy_amount: 46800
  },
  {
    id: 'fallback-5',
    sku: 'APN-OFFGRID-5KW',
    name: '5kW Off-Grid Solar System',
    category: 'off-grid',
    capacity_kw: 5,
    price: 210000,
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/5kW%20off-grid%20solar%20system.png',
    description: 'Complete 5kW off-grid solar system for large homes',
    warranty_years: 25,
    installation_days: 5,
    subsidy_amount: 78000
  }
];

function Home() {
  const [roofSize, setRoofSize] = useState<number>(5);
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from database when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching products from Supabase...');
        const { data, error } = await supabase
          .from('product_skus')
          .select('*')
          .order('capacity_kw', { ascending: true });
          
        if (error) {
          console.error('Supabase Error:', error);
          setError('Failed to fetch products from database');
          // Use fallback data
          setProducts(fallbackProducts);
          return;
        }
        
        console.log('Supabase response:', data);
        
        if (data && data.length > 0) {
          setProducts(data as Product[]);
          console.log('Products loaded successfully:', data.length, 'items');
        } else {
          console.warn('No products found in database, using fallback data');
          // Use fallback data if no products in database
          setProducts(fallbackProducts);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        // Use fallback data in case of error
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Update recommended product when roof size changes
  useEffect(() => {
    if (products.length === 0) {
      console.log('No products available to select from');
      return;
    }
    
    // Find the product with power closest to the selected roof size
    try {
      const closest = products.reduce((prev, curr) => {
        return (Math.abs(curr.capacity_kw - roofSize) < Math.abs(prev.capacity_kw - roofSize) ? curr : prev);
      });
      
      console.log('Selected recommended product:', closest.name, `(${closest.capacity_kw}kW)`);
      setRecommendedProduct(closest);
    } catch (err) {
      console.error('Error selecting recommended product:', err);
      // If unable to find closest match, use first product as fallback
      if (products.length > 0) {
        setRecommendedProduct(products[0]);
      }
    }
  }, [roofSize, products]);

  // Calculate all ROI values reactively using useMemo
  // This guarantees values update whenever any dependency changes
  const roiValues = useMemo(() => {
    console.log(`Calculating values with roofSize=${roofSize}`);
    
    // Solar installation ROI calculation
    const monthlyBill = roofSize * 1000;
    const yearlyBill = monthlyBill * 12;
    const monthlyWattage = roofSize * 140; // Approx 140 kWh per kW per month
    const area = Math.round(roofSize * 8 * 10.764);
    
    return {
      monthly: monthlyBill,
      yearly: yearlyBill,
      monthlyWattage,
      area,
      payback: 4
    };
  }, [roofSize]);

  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Debug logging whenever roofSize changes
  useEffect(() => {
    console.log('roofSize changed to:', roofSize);
    
    const monthlyBill = roofSize * 1000;
    const yearlyBill = monthlyBill * 12;
    const monthlyWattage = roofSize * 140;
    const area = Math.round(roofSize * 8 * 10.764);
    
    console.log('Updating ROI values directly in useEffect:', {
      monthly: monthlyBill,
      yearly: yearlyBill,
      monthlyWattage,
      area,
      payback: 4
    });
  }, [roofSize]);

  // Use roiValues instead of calling calculateROI directly in the render function
  return (
    <div className="min-h-screen">
      {/* Hero Section: Rooftop Solar */}
      <section className="relative min-h-[80vh] flex items-center py-8 md:py-12 lg:py-16">
        {/* Video Background with Enhanced Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Enhanced gradient overlay for better text contrast */}
          <div 
            className="absolute inset-0" 
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(204, 255, 0, 0.2) 0%, rgba(0, 0, 0, 0) 60%)',
              animation: 'pulse 8s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute inset-0" 
            style={{
              background: 'radial-gradient(circle at 70% 30%, rgba(0, 225, 255, 0.15) 0%, rgba(0, 0, 0, 0) 60%)',
              animation: 'pulse 8s ease-in-out infinite alternate'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/70 to-dark" />
          
          {/* Premium background container - removed image */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Decorative circle accent like in service cards */}
            <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-primary/10 transition-all duration-500" />
            <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-secondary/10 transition-all duration-500" />
            
            {/* Subtle border overlay for glass effect */}
            <div className="absolute inset-0 border-t border-white/5 bg-[#0A0A0A]" />
            
            {/* Replaced background image with modern gradient background */}
            <div className="absolute inset-0" 
              style={{
                background: 'linear-gradient(135deg, #0A0A0A 0%, #121212 100%)',
                backgroundSize: '400% 400%'
              }}
            >
              {/* Grid pattern overlay for texture */}
              <div className="absolute inset-x-0 top-[15px] bottom-[10px]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
                backgroundSize: '30px 30px'
              }} />
              {/* Subtle animated glow spots with native animation classes */}
              <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-pulse" 
                style={{ animationDelay: '2s' }} />
            </div>
          </div>
          
          {/* Decorative elements */}
          <motion.div 
            animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 -right-20 w-80 h-80 rounded-full border border-primary/20 opacity-20"
          />
          <motion.div 
            animate={{ opacity: [0.2, 0.4, 0.2], y: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 -left-40 w-96 h-96 rounded-full border border-secondary/20 opacity-20"
          />
        </div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-6 max-w-6xl py-8 md:py-12"
        >
          {/* ImageCarousel for mobile (top) */}
          <div className="block md:hidden mb-8 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-56 xs:h-72 sm:h-80 rounded-2xl overflow-hidden flex items-center"
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-black/5">
                <div className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden">
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: "linear-gradient(45deg, rgba(204, 255, 0, 0.3) 0%, rgba(0, 225, 255, 0.15) 50%, rgba(204, 255, 0, 0.3) 100%)",
                    backgroundSize: "200% 200%",
                    animation: "gradientBorder 8s linear infinite",
                  }}></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/70 to-dark" />
                <div className="absolute inset-0 z-0">
                  <ImageCarousel />
                </div>
                <div className="absolute inset-0 z-20 pointer-events-none" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)",
                  backgroundSize: "20px 20px"
                }}></div>
              </div>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Left side content - Enhanced for mobile */}
                <div className="text-left">
                  {/* Mobile-optimized heading with better line height and letter spacing */}
                  <h1 className="text-[3.6rem] sm:text-[3.36rem] md:text-[3.6rem] lg:text-6xl font-extrabold text-primary mb-3 md:mb-6 font-heading leading-[1.15] tracking-tight mt-[2.5vh] sm:mt-0">
                    अपनी छत को बनाएं कमाई का ज़रिया
                  </h1>
                  
                  {/* Enhanced description with better spacing and line height */}
                  <p className="text-lg sm:text-lg md:text-xl text-light/90 mb-7 leading-relaxed max-w-[95%]">
                    Type 3 transforms rooftops into income-generating solar assets.
                  </p>
              
                  {/* Installation highlights - Enhanced for mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {/* Mobile-optimized feature cards with hover effects */}
                    <motion.div 
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                        <IndianRupee className="h-6 w-6" />
                      </div>
                      <div className="text-base font-medium text-light/90">Save up to 90% on electricity bills</div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="text-base font-medium text-light/90">Government subsidies available</div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="text-base font-medium text-light/90">25+ years system lifespan</div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="text-base font-medium text-light/90">Premium quality panels</div>
                    </motion.div>
                  </div>

                  {/* Enhanced CTA button with animation - moved further below and full width */}
                  <div className="flex mt-12">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button 
                        to="/products" 
                        variant="primary" 
                        size="lg" 
                        className="w-full shadow-lg shadow-primary/20 font-medium text-base"
                      >
                        Explore Products
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right side - Dynamic Image Carousel */}
            <div className="hidden md:block">
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.8, delay: 0.3 }}
                 className="relative h-[550px] rounded-2xl overflow-hidden mt-12 md:mt-0 flex items-center"
               >
                 {/* Container with glowing border */}
                 <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-black/5" style={{
                   boxShadow: "0 0 40px 2px rgba(204, 255, 0, 0.1), inset 0 0 20px 0px rgba(0, 0, 0, 0.3)"
                 }}>
                   
                   {/* Animated gradient border */}
                   <div className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden">
                     <div className="absolute inset-0 rounded-2xl" style={{
                       background: "linear-gradient(45deg, rgba(204, 255, 0, 0.3) 0%, rgba(0, 225, 255, 0.15) 50%, rgba(204, 255, 0, 0.3) 100%)",
                       backgroundSize: "200% 200%",
                       animation: "gradientBorder 8s linear infinite",
                     }}></div>
                   </div>
                   
                   {/* Inner shadow overlay */}
                   <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/70 to-dark" />
                   
                   {/* Dynamic image carousel */}
                   <div className="absolute inset-0 z-0">
                     <ImageCarousel />
                   </div>
                   
                   {/* Overlay with grid texture */}
                   <div className="absolute inset-0 z-20 pointer-events-none" style={{
                     backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)",
                     backgroundSize: "20px 20px"
                   }}></div>
                 </div>
               </motion.div>
             </div> 
          </div>
        </motion.div>
      </section>

      {/* Core Products - Rooftop Solar Only */}
      <section className="relative bg-gradient-to-b from-dark-900 to-dark py-16 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{background: 'radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.5) 0%, rgba(0, 0, 0, 0) 45%)'}} />
          <div className="absolute top-0 right-0 w-full h-full" style={{background: 'radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.5) 0%, rgba(0, 0, 0, 0) 45%)'}} />
        </div>

        <div className="container mx-auto px-6 sm:px-6 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Rooftop Solar Card */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group min-h-[420px] flex flex-col backdrop-blur-lg bg-white/5 border border-white/10 hover:border-primary/20 transition-all duration-300 p-6 md:p-8"
            >
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                    <HomeIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xl font-medium text-light/80 mb-0.5">Solar Power</h3>
                    <p className="text-sm text-light/60">Home Energy Solution</p>
                  </div>
                </div>
                
                {/* Main content */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-3xl font-bold text-light">Turn your roof into a money-saving machine.</h3>
                  <p className="text-light/60 text-lg">Generate your own electricity and cut bills by up to 90%.</p>
                </div>
                
                {/* Benefits list */}
                <div className="flex-grow">
                  <ul className="space-y-4">
                    <motion.li 
                      className="flex items-center text-light/80 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                      whileHover={{ x: 10 }}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <IndianRupee className="h-6 w-6" />
                      </div>
                      <span>Save up to ₹45,000/year</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center text-light/80 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                      whileHover={{ x: 10 }}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                      </div>
                      <span>₹78,000 subsidy available</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center text-light/80 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                      whileHover={{ x: 10 }}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <Car className="h-5 w-5" />
                      </div>
                      <span>EV-charging ready homes</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center text-light/80 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                      whileHover={{ x: 10 }}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <Battery className="h-5 w-5" />
                      </div>
                      <span>Net metering & 25-year performance</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center text-light/80 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                      whileHover={{ x: 10 }}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <span>AMC & app-based tracking</span>
                    </motion.li>
                  </ul>
                </div>
                
                {/* CTA Button */}
                <Button 
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-8"
                  onClick={() => setIsSiteVisitModalOpen(true)}
                >
                  Book Site Visit
                </Button>
              </div>
            </motion.div>

            {/* Comparison Table */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group min-h-[420px] flex flex-col backdrop-blur-lg bg-white/5"
            >
              {/* Background effects matching home section style */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{background: 'radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)'}} />
                <div className="absolute top-0 right-0 w-full h-full" style={{background: 'radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)'}} />
                <div className="absolute top-0 right-0 w-full h-full opacity-5" style={{background: 'url("/images/solar-pattern.svg") repeat'}} />
              </div>
              
              <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md p-6 md:p-8 relative z-10 flex flex-col flex-1 group-hover:shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="text-primary flex justify-center items-center bg-white/5 p-3 rounded-lg mr-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xl font-bold text-light mb-0.5">Compare & Save</h3>
                    <p className="text-light/60 text-sm">See your potential savings with solar</p>
                  </div>
                </div>
                
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-primary/20 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-light/80">Current Monthly Bill</span>
                      <span className="text-xl font-bold text-primary">₹5,000</span>
                    </div>
                    <div className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-primary/20 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-light/80">After Solar (Monthly)</span>
                      <span className="text-xl font-bold text-primary">₹500</span>
                    </div>
                    <div className="transition-all duration-300 bg-primary/10 border border-primary/20 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-light">Monthly Savings</span>
                      <span className="text-2xl font-bold text-primary">₹4,500</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-light">Additional Benefits</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-light/80">
                        <div className="text-primary flex justify-center items-center bg-white/5 p-1.5 rounded-full">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span>Increase property value</span>
                      </li>
                      <li className="flex items-center gap-3 text-light/80">
                        <div className="text-primary flex justify-center items-center bg-white/5 p-1.5 rounded-full">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span>Reduce carbon footprint</span>
                      </li>
                      <li className="flex items-center gap-3 text-light/80">
                        <div className="text-primary flex justify-center items-center bg-white/5 p-1.5 rounded-full">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span>Energy independence</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Calculator Section */}
      <section className="py-16 relative" id="calculator">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-dark opacity-95" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 35%, rgba(204, 255, 0, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 65%, rgba(0, 180, 216, 0.03) 0%, transparent 55%)',
          }} />
          <div className="absolute top-0 right-0 w-full h-full opacity-5" style={{background: 'url("/images/solar-pattern.svg") repeat'}} />
          <div className="absolute left-0 top-1/4 w-40 h-80 rounded-full bg-primary/5 filter blur-3xl opacity-20 animate-pulse" style={{animationDuration: '15s'}} />
          <div className="absolute right-0 bottom-1/4 w-60 h-60 rounded-full bg-primary/10 filter blur-3xl opacity-20 animate-pulse" style={{animationDuration: '20s', animationDelay: '2s'}} />
        </div>

        <div className="container mx-auto px-6 sm:px-6 max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            {/* Interactive Tool badge removed */}
            
            <h2 className="text-[calc(1.2*1.1*1.25rem)] md:text-[calc(1.2*1.1*1.25rem)] lg:text-[calc(1.1*2.5rem)] font-bold text-light mb-4">Calculate Your Solar <span className="text-primary">Savings</span></h2>
            <p className="text-lg text-light/70 max-w-2xl mx-auto">
              See how much you can save with rooftop solar energy for your home or business.
              Adjust the system size to match your needs.
            </p>
          </motion.div>

          {/* Enhanced Calculator Content */}
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10"
            >
              {/* Left side: Inputs - Standardized styling */}
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group min-h-[420px] flex flex-col backdrop-blur-lg bg-white/5"
              >
                {/* Background effects matching home section style */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full" style={{background: 'radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)'}} />
                  <div className="absolute top-0 right-0 w-full h-full" style={{background: 'radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)'}} />
                  <div className="absolute top-0 right-0 w-full h-full opacity-5" style={{background: 'url("/images/solar-pattern.svg") repeat'}} />
                </div>
                
                <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md p-6 md:p-8 relative z-10 flex flex-col flex-1 group-hover:shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="text-primary flex justify-center items-center bg-white/5 p-3 rounded-lg mr-4">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-xl font-bold text-light mb-0.5">System Specifications</h3>
                      <p className="text-light/60 text-sm">Customize your solar system size</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-base font-medium text-light">Roof Size (kW)</label>
                        <motion.span 
                          key={roofSize} // This forces the animation to run each time the value changes
                          initial={{ scale: 1.2, color: "#ccff00" }}
                          animate={{ scale: 1, color: "#ccff00" }}
                          transition={{ duration: 0.3 }}
                          className="text-xl font-mono font-bold"
                        >
                          {roofSize} kW
                        </motion.span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-3 py-3">
                        {[1, 2, 5, 10, 20].map((size) => (
                          <button
                            key={size}
                            onClick={() => setRoofSize(size)}
                            className={`relative rounded-xl py-4 flex flex-col items-center justify-center transition-all duration-300 ${roofSize === size 
                              ? 'bg-primary text-dark font-medium shadow-md' 
                              : 'bg-dark-800/50 text-light/70 hover:bg-dark-700/50 border border-white/5'}`}
                          >
                            <span className="text-lg font-medium">{size}</span>
                            <span className="text-xs">kW</span>
                            {/* Motion indicator removed */}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-primary/20 rounded-lg p-5 md:p-6 mt-auto shadow-lg shadow-dark/20">
                      <div className="flex items-center gap-4">
                        <div className="text-primary flex justify-center items-center bg-primary/10 p-3 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-light/70">Average roof area needed:</div>
                          <div>
                            <motion.span 
                              key={roiValues.area} // Force animation on value change
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="font-bold text-primary text-xl"
                            >
                              ~{roiValues.area} sq.ft
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right side: Results - Standardized styling */}
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group min-h-[420px] flex flex-col backdrop-blur-lg bg-white/5"
              >
                {/* Background effects matching home section style */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full" style={{background: 'radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)'}} />
                  <div className="absolute top-0 right-0 w-full h-full" style={{background: 'radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)'}} />
                  <div className="absolute top-0 right-0 w-full h-full opacity-5" style={{background: 'url("/images/solar-pattern.svg") repeat'}} />
                </div>
                
                <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md p-6 md:p-8 relative z-10 flex flex-col flex-1 group-hover:shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="text-primary flex justify-center items-center bg-white/5 p-3 rounded-lg mr-4">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-xl font-bold text-light mb-0.5">Financial Benefits</h3>
                      <p className="text-light/60 text-sm">Estimated savings with solar power</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <motion.div 
                      key={roiValues.monthly}
                      initial={{ opacity: 0.7, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-primary/20 rounded-lg p-5 text-center"
                    >
                      <p className="text-light/60 mb-1 text-sm">Monthly Electricity Savings</p>
                      <div className="text-4xl font-bold text-primary">₹{roiValues.monthly.toLocaleString()}</div>
                    </motion.div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        key={roiValues.yearly}
                        initial={{ opacity: 0.7, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-primary/20 p-4 rounded-lg text-center"
                      >
                        <p className="text-light/60 mb-1 text-sm">Yearly Savings</p>
                        <div className="text-2xl font-bold text-primary">₹{roiValues.yearly.toLocaleString()}</div>
                      </motion.div>
                      
                      <motion.div 
                        key={roiValues.monthlyWattage}
                        initial={{ opacity: 0.7, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-primary/20 p-4 rounded-lg text-center"
                      >
                        <p className="text-light/60 mb-1 text-sm">Monthly Generation</p>
                        <div className="text-2xl font-bold text-primary">{roiValues.monthlyWattage} kWh</div>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      key={roiValues.payback}
                      initial={{ opacity: 0.7, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-primary/20 p-4 rounded-lg mt-auto"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-light/80 text-sm">System Payback Period</span>
                        <span className="text-xl font-bold text-primary">{roiValues.payback} years</span>
                      </div>
                      <div className="w-full bg-dark-300 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div 
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (roiValues.payback/10) * 100)}%` }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Product Recommendation Card - Standardized design */}
              <div className="col-span-1 lg:col-span-2 mt-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group"
                >
                  {/* Background effects matching home section style */}
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full" style={{background: 'radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)'}} />
                    <div className="absolute top-0 right-0 w-full h-full" style={{background: 'radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)'}} />
                    <div className="absolute top-0 right-0 w-full h-full opacity-5" style={{background: 'url("/images/solar-pattern.svg") repeat'}} />
                  </div>
                  
                  <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md p-6 md:p-8 relative z-10">
                    {/* Perfect Match Badge */}
                    <div className="absolute top-6 right-6 bg-primary text-dark font-bold px-4 py-1.5 rounded-lg text-sm shadow-lg z-10 flex items-center">
                      <motion.div
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                        className="mr-1.5"
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Perfect Match
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
                      {/* Product Image with standardized styling */}
                      <div className="w-full md:w-1/3 lg:w-1/4 relative">
                        <div className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
                          {recommendedProduct ? (
                            <img 
                              src={recommendedProduct.image_url} 
                              alt={recommendedProduct.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                              onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src = '/images/solar-default.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-dark-800">
                              <Zap className="h-16 w-16 text-primary/50 animate-pulse" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent" />
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center">
                            <span className="bg-dark-900/80 px-4 py-1.5 rounded-lg border border-white/10 font-mono text-lg">
                              <motion.span 
                                key={recommendedProduct?.capacity_kw || roofSize}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-primary font-bold"
                              >
                                {recommendedProduct?.capacity_kw || roofSize}kW
                              </motion.span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Details with standardized layout */}
                      <div className="flex-1 flex flex-col justify-between">
                        {recommendedProduct ? (
                          <>
                            <div className="space-y-6">
                              <div>
                                <div className="text-primary text-sm font-medium mb-1">
                                  {recommendedProduct.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <h3 className="text-3xl font-bold text-light group-hover:text-primary transition-colors duration-300">
                                  {recommendedProduct.name}
                                </h3>
                                <p className="text-light/60 text-lg mt-2">{recommendedProduct.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-6 mb-8">
                                <motion.div 
                                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                  className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                                >
                                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                                    <IndianRupee className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <div className="text-base font-medium text-light/90">Price</div>
                                    <div className="text-xl font-bold text-primary">
                                      ₹{recommendedProduct.price.toLocaleString()}
                                    </div>
                                  </div>
                                </motion.div>
                                
                                <motion.div 
                                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                  className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                                >
                                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                                    <Shield className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <div className="text-base font-medium text-light/90">Warranty</div>
                                    <div className="text-xl font-bold text-primary">
                                      {recommendedProduct.warranty_years} Years
                                    </div>
                                  </div>
                                </motion.div>
                                
                                <motion.div 
                                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                  className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                                >
                                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                                    <Clock className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <div className="text-base font-medium text-light/90">Installation</div>
                                    <div className="text-xl font-bold text-primary">
                                      {recommendedProduct.installation_days} Days
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                            
                            <Button
                              to="/products"
                              variant="primary"
                              size="lg"
                              radius="lg"
                              className="mt-4 shadow-md"
                            >
                              <span className="flex items-center justify-center">
                                View Details
                                <motion.div
                                  animate={{ x: [0, 5, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                                  className="ml-2"
                                >
                                  <ArrowRight className="h-5 w-5" />
                                </motion.div>
                              </span>

                            </Button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-10">
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Zap className="h-16 w-16 text-primary/70 mb-4" />
                            </motion.div>
                            <p className="text-light/60 text-center text-lg">Loading product recommendations...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Call-to-Action Section */}
      <section className="py-16 bg-dark-900 relative overflow-hidden">
        {/* Enhanced decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-2xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
            className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-2xl"
          />
          {/* Animated light beams */}
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.2, 0.1], 
              width: ["60%", "70%", "60%"],
              rotate: [0, 5, 0] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              width: ["70%", "80%", "70%"],
              rotate: [0, -3, 0] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/3 right-0 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent"
          />
          {/* Solar panel grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(204, 255, 0, 0.1) 40px, rgba(204, 255, 0, 0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(204, 255, 0, 0.1) 40px, rgba(204, 255, 0, 0.1) 41px)'
          }}></div>
        </div>

        <div className="container mx-auto px-6 sm:px-6 max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-8 p-6 md:p-8"
          >
            {/* Enhanced title with animated highlight */}
            <h2 className="text-[calc(1.2*1.1*1.25rem)] md:text-[calc(1.2*1.1*1.25rem)] lg:text-[calc(1.1*2.5rem)] font-bold text-light mb-4">
              Ready to
              <span className="relative mx-3">
                <span className="relative z-10 bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text no-underline">Go Solar</span>
              </span>
              ?
            </h2>
            
            <p className="text-lg md:text-xl text-light/70 max-w-2xl mx-auto">
              Schedule a free consultation with our solar experts and get a customized quote for your home.
            </p>

            {/* Enhanced CTA buttons */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap justify-center gap-4 mt-10 max-w-md mx-auto sm:max-w-none">
              <Button
                to="/products"
                variant="primary"
                size="lg"
                radius="lg"
                className="shadow-md w-full sm:w-auto"
              >
                {/* Animated background effect removed */}
                <span className="relative z-10 flex items-center justify-center">
                  Sign In 
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                    className="ml-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </span>
              </Button>
              
              <Button
                onClick={() => setIsSiteVisitModalOpen(true)}
                variant="ghost"
                size="lg"
                radius="lg"
                className="border border-white/10 hover:border-primary/20 text-primary hover:bg-primary/10 active:bg-primary/15 shadow-md w-full sm:w-auto"
                aria-haspopup="dialog"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Book Consultation
                </span>
                <span className="absolute inset-0 bg-primary/5 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
              </Button>
            </div>

            <div className="w-full flex justify-center">
              <hr className="w-3/4 border-t border-white/10 rounded-full shadow-sm my-12" />
            </div>

            {/* Social proof/trust indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-nowrap justify-center items-stretch gap-6 mt-16 overflow-x-auto md:overflow-visible"
            >
              <div className="motion-card flex flex-col items-center gap-4 bg-gradient-to-br from-white/5 via-dark-800/80 to-dark-900/90 border border-white/10 rounded-2xl px-6 py-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:border-primary/30 w-48 min-w-[12rem] justify-center text-center">
  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 p-2 shadow ring-1 ring-primary/10">
    <Shield className="h-6 w-6 text-primary" />
  </span>
  <span className="text-light font-semibold text-sm md:text-base leading-snug tracking-tight"><span className="block">5-Year</span><span className="block">Warranty</span></span>
</div>
              
              <div className="motion-card flex flex-col items-center gap-4 bg-gradient-to-br from-white/5 via-dark-800/80 to-dark-900/90 border border-white/10 rounded-2xl px-6 py-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:border-primary/30 w-48 min-w-[12rem] justify-center text-center">
  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 p-2 shadow ring-1 ring-primary/10">
    <Users className="h-6 w-6 text-primary" />
  </span>
  <span className="text-light font-semibold text-sm md:text-base leading-snug tracking-tight"><span className="block">1000+</span><span className="block">Satisfied Customers</span></span>
</div>
              
              <div className="motion-card flex flex-col items-center gap-4 bg-gradient-to-br from-white/5 via-dark-800/80 to-dark-900/90 border border-white/10 rounded-2xl px-6 py-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:border-primary/30 w-48 min-w-[12rem] justify-center text-center">
  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 p-2 shadow ring-1 ring-primary/10">
    <CheckCircle2 className="h-6 w-6 text-primary" />
  </span>
  <span className="text-light font-semibold text-sm md:text-base leading-snug tracking-tight"><span className="block">Premium Quality</span><span className="block">Products</span></span>
</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Site Visit Form Modal */}
      <SiteVisitForm
        isOpen={isSiteVisitModalOpen}
        onClose={() => setIsSiteVisitModalOpen(false)}
        productSku={recommendedProduct?.sku || ''}
        productName={recommendedProduct?.name || 'Solar Consultation'}
        productPower={recommendedProduct?.capacity_kw || roofSize}
      />
    </div>
  );
}
//05618324
export default Home;