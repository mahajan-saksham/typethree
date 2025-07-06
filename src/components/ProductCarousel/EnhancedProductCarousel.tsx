import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sun,
  Zap,
  Shield,
  TrendingUp,
  Star,
  Clock,
  Check,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CarouselProduct {
  id: string;
  name: string;
  capacity: string;
  startingPrice: string;
  originalPrice?: string;
  monthlySavings: string;
  yearlyOutput: string;
  keyBenefit: string;
  image: string;
  category: string;
  route: string;
  features: string[];
  subsidy: string;
  warranty: string;
  installation: string;
  roi: string;
  badge?: string;
}

// Enhanced featured products data
const featuredProducts: CarouselProduct[] = [
  {
    id: 'ONGRID-3KW-001',
    name: '3kW On-Grid Solar System',
    capacity: '3kW',
    startingPrice: '₹1.3L',
    originalPrice: '₹1.8L',
    monthlySavings: '₹4,500',
    yearlyOutput: '4,500 kWh',
    keyBenefit: 'Perfect for small homes',
    image: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/On-grid%20solar%20system/3kW%20on-grid%20solar%20system.png',
    category: 'Residential',
    route: '/products/ONGRID-3KW-001',
    features: ['Government Subsidy', '25 Year Warranty', 'Net Metering'],
    subsidy: '₹46,800',
    warranty: '25 Years',
    installation: '2-3 Days',
    roi: '4-5 Years',
    badge: 'Most Popular'
  },
  {
    id: 'ONGRID-5KW-001',
    name: '5kW On-Grid Solar System',
    capacity: '5kW',
    startingPrice: '₹2.1L',
    originalPrice: '₹2.8L',
    monthlySavings: '₹7,500',
    yearlyOutput: '7,500 kWh',
    keyBenefit: 'Ideal for medium homes',
    image: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/On-grid%20solar%20system/5kW%20on-grid%20solar%20system.png',
    category: 'Residential',
    route: '/products/ONGRID-5KW-001',
    features: ['Maximum Subsidy', 'Premium Panels', 'Smart Monitoring'],
    subsidy: '₹78,000',
    warranty: '25 Years',
    installation: '3-4 Days',
    roi: '4 Years',
    badge: 'Best Value'
  },
  {
    id: 'ONGRID-10KW-001',
    name: '10kW On-Grid Solar System',
    capacity: '10kW',
    startingPrice: '₹4.2L',
    originalPrice: '₹5.6L',
    monthlySavings: '₹15,000',
    yearlyOutput: '15,000 kWh',
    keyBenefit: 'Best for large homes & small business',
    image: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/On-grid%20solar%20system/10kW%20on-grid%20solar%20system.png',
    category: 'Commercial',
    route: '/products/ONGRID-10KW-001',
    features: ['Commercial Grade', 'High Efficiency', 'Remote Monitoring'],
    subsidy: '₹78,000',
    warranty: '25 Years',
    installation: '4-5 Days',
    roi: '3.5 Years'
  },
  {
    id: 'OFFGRID-3KW-001',
    name: '3kW Off-Grid Solar System',
    capacity: '3kW',
    startingPrice: '₹1.26L',
    monthlySavings: '₹4,500',
    yearlyOutput: '4,500 kWh',
    keyBenefit: 'Complete energy independence',
    image: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/3kW%20off-grid%20solar%20system.png',
    category: 'Off-Grid',
    route: '/products/OFFGRID-3KW-001',
    features: ['Battery Backup', '24/7 Power', 'No Grid Dependency'],
    subsidy: '₹46,800',
    warranty: '25 Years',
    installation: '4-5 Days',
    roi: '5 Years',
    badge: 'Energy Independent'
  }
];

export const EnhancedProductCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const currentProduct = featuredProducts[currentSlide];

  // Enhanced slide variants for smoother transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    })
  };

  const contentVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Enhanced Background with Parallax Effect */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`bg-${currentSlide}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1] 
          }}
          className="absolute inset-0"
        >
          {/* Product Image with Enhanced Styling */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
          
          {/* Enhanced Gradient Overlays - Inspired by the design examples */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
          
          {/* Animated Accent Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl"
          />
        </motion.div>
      </AnimatePresence>

      {/* Category Badge - Enhanced with Animation */}
      <div className="absolute top-6 left-6 z-30">
        <AnimatePresence mode="wait">
          <motion.div
            key={`badge-${currentSlide}`}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-2"
          >
            {currentProduct.badge && (
              <div className="px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm border border-primary text-dark font-bold text-xs">
                ✨ {currentProduct.badge}
              </div>
            )}
            <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-lg border border-white/20">
              <span className="text-primary font-semibold text-sm">{currentProduct.category}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 hover:border-primary/40 transition-all duration-300 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 hover:border-primary/40 transition-all duration-300 group"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Enhanced Product Information Card - Inspired by Design Examples */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlide}`}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Modern Glass Card Design */}
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                
                {/* Left: Product Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-xl md:text-2xl mb-2 leading-tight">
                        {currentProduct.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-3">
                        {currentProduct.keyBenefit}
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-primary font-bold text-lg">{currentProduct.capacity}</div>
                        <div className="text-white/50 text-xs">System</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-green-400 font-bold text-lg">{currentProduct.monthlySavings}</div>
                        <div className="text-white/50 text-xs">Monthly</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Shield className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-blue-400 font-bold text-lg">{currentProduct.warranty}</div>
                        <div className="text-white/50 text-xs">Warranty</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Clock className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-orange-400 font-bold text-lg">{currentProduct.roi}</div>
                        <div className="text-white/50 text-xs">Payback</div>
                      </div>
                    </div>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentProduct.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 text-white/80 text-xs rounded-full border border-white/20"
                      >
                        <Check className="w-3 h-3 inline mr-1" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Price & CTA */}
                <div className="text-center lg:text-right">
                  <div className="mb-4">
                    {currentProduct.originalPrice && (
                      <div className="text-white/40 text-sm line-through mb-1">
                        {currentProduct.originalPrice}
                      </div>
                    )}
                    <div className="flex items-baseline justify-center lg:justify-end gap-2 mb-2">
                      <span className="text-white/60 text-sm">from</span>
                      <span className="text-white font-bold text-3xl">{currentProduct.startingPrice}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-end gap-1 text-primary text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Subsidy: {currentProduct.subsidy}</span>
                    </div>
                  </div>

                  <Link
                    to={currentProduct.route}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark font-bold px-6 py-3 rounded-xl transition-all duration-300 group transform hover:scale-105"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {featuredProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative overflow-hidden rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'w-8 h-2 bg-primary' 
                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            }`}
          >
            {index === currentSlide && (
              <motion.div
                className="absolute inset-0 bg-primary/50"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 6 }}
                key={`progress-${currentSlide}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Auto-play Indicator */}
      <div className="absolute top-6 right-6 z-30">
        <div className="relative w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Sun className="w-5 h-5 text-primary" />
          {isAutoPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCarousel;
