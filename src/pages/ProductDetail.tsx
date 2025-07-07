import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Sun, 
  Zap, 
  Home, 
  Clock, 
  ChevronRight,
  Check,
  Info,
  Leaf,
  Wallet,
  Calculator,
  Phone,
  MessageCircle,
  Star,
  Users,
  Award,
  TrendingUp,
  Battery,
  Settings,
  Gauge
} from 'lucide-react';
import { products, Product } from '../data/products';

// Variant type for capacity options
interface ProductVariant {
  capacity: string;
  capacity_kw: number;
  price: number;
  subsidized_price: number;
  monthly_savings: number;
  daily_units: number;
  area_required: number;
  payback_period: number;
}

// Generate single variant based on product's actual specifications
const generateVariants = (product: Product): ProductVariant[] => {
  const capacity_kw = parseFloat(product.capacity_kw || '3');
  const price = product.price || 100000;
  const sale_price = product.sale_price || price;
  
  // Calculate subsidized price properly
  let subsidized_price = sale_price;
  if (product.hasSubsidy && product.subsidy_amount) {
    subsidized_price = sale_price; // sale_price already includes subsidy discount
  }
  
  const monthly_savings = product.monthly_savings || Math.round(capacity_kw * 1000);
  
  // Create single variant matching product specifications
  return [{
    capacity: `${capacity_kw}kW`,
    capacity_kw: capacity_kw,
    price: price,
    subsidized_price: subsidized_price,
    monthly_savings: monthly_savings,
    daily_units: capacity_kw * 4, // Standard 4 units per kW per day
    area_required: capacity_kw * 100, // Standard 100 sq ft per kW
    payback_period: Math.round(subsidized_price / (monthly_savings * 12)) // Years to recover investment
  }];
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex] = useState(0);
  const [showROICalculator, setShowROICalculator] = useState(false);
  const [monthlyBill, setMonthlyBill] = useState(5000);
  
  // Find the product
  const product = products.find(p => p.id === id);
  
  // Generate variants for the product
  const variants = product ? generateVariants(product) : [];
  
  // Set the single variant that matches product specifications
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]); // Always select the first (and only) variant
    }
  }, [variants, selectedVariant]);
  
  // Handle not found
  if (!product) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="container mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold text-light mb-4">Product not found</h2>
          <Link to="/products" className="text-primary hover:underline">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }
  
  // Product images - use multiple if available, otherwise duplicate the main image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url, product.image_url, product.image_url].filter(Boolean);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const calculateEMI = (principal: number, months: number = 60) => {
    const rate = 0.08 / 12; // 8% annual rate
    const emi = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    return Math.round(emi);
  };

  const calculateSavings = () => {
    if (!selectedVariant) return { monthlySavings: 0, annualSavings: 0, yearlyGeneration: 0 };
    
    const yearlyGeneration = selectedVariant.daily_units * 365;
    const monthlySavings = selectedVariant.monthly_savings;
    const annualSavings = monthlySavings * 12;
    
    return { monthlySavings, annualSavings, yearlyGeneration };
  };

  const generateWhatsAppLink = () => {
    const message = `Hi Team Type3, I'm interested in the ${product.name}. Please provide more details about system sizing options and a customized quote for my requirements.`;
    return `https://wa.me/918095508066?text=${encodeURIComponent(message)}`;
  };

  const savings = calculateSavings();

  return (
    <div className="min-h-screen bg-dark">
      {/* Header with breadcrumb */}
      <div className="bg-dark-100/30 border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center text-sm text-gray-400">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-light">{product.name}</span>
          </nav>
        </div>
      </div>
      
      {/* Enhanced Hero Section with Home Page Design Elements */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[calc(80vh+200px)] sm:min-h-[80vh] flex items-center py-8 md:py-12 lg:py-16 overflow-hidden"
      >
        {/* Enhanced Background with Animated Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Enhanced gradient overlay for better visual depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, rgba(204, 255, 0, 0.2) 0%, rgba(0, 0, 0, 0) 60%)",
              animation: "pulse 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 70% 30%, rgba(0, 225, 255, 0.15) 0%, rgba(0, 0, 0, 0) 60%)",
              animation: "pulse 8s ease-in-out infinite alternate",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/70 to-dark" />

          {/* Premium background container with modern gradient */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Decorative circle accents */}
            <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-primary/10 transition-all duration-500" />
            <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-secondary/10 transition-all duration-500" />

            {/* Glass effect border overlay */}
            <div className="absolute inset-0 border-t border-white/5 bg-[#0A0A0A]" />

            {/* Modern gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #0A0A0A 0%, #121212 100%)",
                backgroundSize: "400% 400%",
              }}
            >
              {/* Grid pattern overlay for texture */}
              <div
                className="absolute inset-x-0 top-[15px] bottom-[10px]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)",
                  backgroundSize: "30px 30px",
                }}
              />
              {/* Animated glow spots */}
              <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
              <div
                className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              />
            </div>
          </div>

          {/* Decorative animated elements */}
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 -right-20 w-80 h-80 rounded-full border border-primary/20 opacity-20"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2], y: [0, 20, 0] }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-1/4 -left-40 w-96 h-96 rounded-full border border-secondary/20 opacity-20"
          />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10 pt-8 md:pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            
            {/* Enhanced Product Image with Home Page Styling */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative h-[520px] rounded-2xl overflow-hidden flex items-center"
              >
                {/* Container with enhanced glowing border effect */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-black/5"
                  style={{
                    boxShadow:
                      "0 0 40px 2px rgba(204, 255, 0, 0.1), inset 0 0 20px 0px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden">
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(45deg, rgba(204, 255, 0, 0.3) 0%, rgba(0, 225, 255, 0.15) 50%, rgba(204, 255, 0, 0.3) 100%)",
                        backgroundSize: "200% 200%",
                        animation: "gradientBorder 8s linear infinite",
                      }}
                    ></div>
                  </div>

                  {/* Enhanced product image container */}
                  <div className="absolute inset-0 z-0 bg-gradient-to-br from-dark-900/50 via-dark/40 to-dark-800/60 p-4">
                    <img 
                      src={productImages[selectedImageIndex] || product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl filter drop-shadow-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  {/* Grid texture overlay */}
                  <div
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                </div>
                
                {/* Enhanced Warranty Badge */}
                <div className="absolute top-6 right-6 z-30">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-primary/20 backdrop-blur-lg rounded-xl px-4 py-2 border border-primary/30"
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-semibold text-sm">{product.warranty_years || 25} Year Warranty</span>
                    </div>
                  </motion.div>
                </div>

                {/* Enhanced Capacity Display */}
                <div className="absolute bottom-6 left-6 z-30">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-black/30 backdrop-blur-xl rounded-xl px-6 py-4 border border-white/10"
                  >
                    <div className="text-3xl font-bold text-primary mb-1">
                      {selectedVariant?.capacity || product.capacity || '3kW'}
                    </div>
                    <div className="text-sm text-gray-400">System Capacity</div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Enhanced Product Info with Home Page Styling */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h1 className="hero-title-mobile font-extrabold text-primary mb-3 font-heading tracking-tight leading-tight">
                  {product.name}
                </h1>
                <p className="text-lg md:text-xl text-light/90 mb-4 leading-[1.6] max-w-[95%]">
                  {product.description || 'Complete solar power system with high-efficiency panels, inverter, mounting structure, and performance warranty. Perfect for residential and commercial applications.'}
                </p>
              </motion.div>

              {/* Enhanced Stats Cards - Similar to Home Page Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <motion.div
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium text-light/90">
                    {selectedVariant?.capacity || product.capacity || '3kW'} System
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium text-light/90">
                    {product.installation_time || 3} Days Install
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Pricing Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-light/40 line-through mb-1">
                      {formatCurrency(selectedVariant?.price || product.price || 0)}
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-light/60 text-sm">from</span>
                      <span className="text-white font-bold text-3xl">
                        {formatCurrency(selectedVariant?.subsidized_price || product.sale_price || 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-sm">
                      <Wallet className="w-4 h-4" />
                      <span>Subsidy: ₹{((selectedVariant?.price || 0) - (selectedVariant?.subsidized_price || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-sm text-light/60 mb-1">EMI starts at</div>
                    <div className="text-xl font-bold text-primary mb-1">
                      ₹{calculateEMI(selectedVariant?.subsidized_price || 0).toLocaleString()}/month
                    </div>
                    <div className="text-xs text-light/40">*5 years @ 8% interest</div>
                  </div>
                </div>
                
                {/* Enhanced CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-dark font-bold px-6 py-3 rounded-xl transition-all duration-300 group transform hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Get Quote</span>
                  </a>
                  <button
                    onClick={() => setShowROICalculator(!showROICalculator)}
                    className="inline-flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary/10 font-semibold px-6 py-3 rounded-xl transition-all duration-300 group"
                  >
                    <Calculator className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Calculate ROI</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Features Section with Home Page Design */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        {/* Enhanced background with animated elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dark to-dark-900 opacity-95" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%), radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}
          />
          
          {/* Animated geometric elements */}
          <motion.div
            animate={{ opacity: [0.1, 0.2, 0.1], boxShadow: ["0 0 15px 1px rgba(0, 225, 255, 0.08)", "0 0 25px 2px rgba(0, 225, 255, 0.12)", "0 0 15px 1px rgba(0, 225, 255, 0.08)"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-10 w-72 h-32 bg-cyan-400/10 border border-cyan-400/10 opacity-15 rounded-md -rotate-6"
          />
          <motion.div
            animate={{ opacity: [0.08, 0.16, 0.08], boxShadow: ["0 0 15px 1px rgba(204, 255, 0, 0.05)", "0 0 20px 1px rgba(204, 255, 0, 0.1)", "0 0 15px 1px rgba(204, 255, 0, 0.05)"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            className="absolute top-1/3 -right-20 w-80 h-20 bg-primary/10 border border-primary/10 opacity-10 rounded-md -rotate-12"
          />
          
          {/* Enhanced light beam effect */}
          <div className="absolute top-0 left-1/4 right-1/4 h-40 bg-primary/5 blur-3xl rounded-full transform -translate-y-1/2" />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <h2 className="text-[calc(1.2*1.1*1.25rem)] md:text-[calc(1.2*1.1*1.25rem)] lg:text-[calc(1.1*2.5rem)] font-bold text-light mb-4">
              Why Choose Our <span className="text-primary">Solar Systems</span>?
            </h2>
            <p className="text-lg md:text-xl text-light/70 max-w-3xl mx-auto">
              Experience the future of energy with our cutting-edge solar technology, designed for maximum efficiency, durability, and savings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Sun,
                title: "High Efficiency Panels",
                description: "Monocrystalline panels with 22%+ efficiency for maximum power generation even in low light conditions."
              },
              {
                icon: Battery,
                title: "Advanced Inverter",
                description: "Smart inverter technology with MPPT tracking and real-time monitoring for optimal performance."
              },
              {
                icon: ShieldCheck,
                title: "25-Year Warranty",
                description: "Comprehensive warranty covering panels, inverter, and installation with guaranteed performance."
              },
              {
                icon: Gauge,
                title: "Smart Monitoring",
                description: "Real-time performance tracking through mobile app with alerts and maintenance notifications."
              },
              {
                icon: Settings,
                title: "Easy Maintenance",
                description: "Self-cleaning panels and minimal maintenance requirements for hassle-free operation."
              },
              {
                icon: Leaf,
                title: "Eco-Friendly",
                description: "Reduce your carbon footprint by up to 80% and contribute to a sustainable future."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 rounded-2xl p-6"
              >
                <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-light/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 bg-dark-100/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Technical Specifications
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-dark-100/40 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">System Components</h3>
                <div className="space-y-4">
                  {[
                    { label: "Solar Panels", value: "Monocrystalline, 540W each" },
                    { label: "Inverter", value: "Grid-tie with MPPT technology" },
                    { label: "Mounting Structure", value: "Hot-dip galvanized steel" },
                    { label: "DC Cables", value: "Solar grade, UV resistant" },
                    { label: "AC Protection", value: "MCB, ELCB, SPD included" },
                    { label: "Monitoring", value: "WiFi-enabled smart monitoring" }
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">{spec.label}</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-dark-100/40 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Performance Data</h3>
                <div className="space-y-4">
                  {[
                    { 
                      label: "Annual Generation", 
                      value: `${(selectedVariant?.daily_units || 12) * 365} kWh/year` 
                    },
                    { 
                      label: "Daily Output", 
                      value: `${selectedVariant?.daily_units || 12} units/day` 
                    },
                    { 
                      label: "Peak Power", 
                      value: `${selectedVariant?.capacity || '3kW'}` 
                    },
                    { 
                      label: "Efficiency", 
                      value: "22.1% panel efficiency" 
                    },
                    { 
                      label: "Life Span", 
                      value: "25+ years operational" 
                    },
                    { 
                      label: "Degradation", 
                      value: "<0.5% annually" 
                    }
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">{spec.label}</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Process */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Simple Installation Process
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From consultation to commissioning, we handle everything to make your solar journey seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Site Survey",
                description: "Our experts visit your location to assess roof condition, shading, and electrical requirements.",
                icon: Home
              },
              {
                step: "02", 
                title: "System Design",
                description: "Custom design based on your energy needs, roof layout, and budget requirements.",
                icon: Settings
              },
              {
                step: "03",
                title: "Installation",
                description: "Professional installation by certified technicians with minimal disruption to your routine.",
                icon: Check
              },
              {
                step: "04",
                title: "Commissioning",
                description: "Testing, grid connection, and net metering setup to start generating clean energy.",
                icon: Zap
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary text-dark w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section className="py-16 bg-dark-100/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Trusted by 10,000+ Happy Customers
            </h2>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-gray-400">Installations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">25+</div>
                <div className="text-sm text-gray-400">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-gray-400">Customer Rating</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                location: "Bangalore",
                rating: 5,
                review: "Amazing experience! Our electricity bill has reduced by 80% and the installation was completed in just 2 days. Highly recommended!",
                savings: "₹3,500/month"
              },
              {
                name: "Priya Sharma", 
                location: "Delhi",
                rating: 5,
                review: "The team was professional and the monitoring app is fantastic. We can track our energy generation in real-time.",
                savings: "₹4,200/month"
              },
              {
                name: "Arjun Patel",
                location: "Mumbai", 
                rating: 5,
                review: "Best investment we've made! The system is performing better than expected and the support team is very responsive.",
                savings: "₹5,800/month"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-100/40 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.review}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-success font-bold">{testimonial.savings}</div>
                    <div className="text-xs text-gray-400">Monthly Savings</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA Section with Home Page Styling */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        {/* Enhanced background with animated elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dark to-dark-900" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 75%, rgba(204, 255, 0, 0.15) 0%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at 75% 25%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}
          />
          
          {/* Animated decorative elements */}
          <motion.div
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          />
          <motion.div
            animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-cyan-400/10 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 text-center shadow-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Go <span className="text-primary">Solar</span>?
              </h2>
              <p className="text-lg md:text-xl text-light/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of satisfied customers who have already made the switch to clean, renewable energy. 
                Start saving money and the environment today.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
            >
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-dark font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 group text-lg"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Get Free Quote Now</span>
              </a>
              
              <a
                href="tel:+918095508066"
                className="inline-flex items-center gap-3 border border-primary text-primary hover:bg-primary/10 font-semibold py-4 px-8 rounded-xl transition-all duration-300 group text-lg"
              >
                <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Call: +91 80955 08066</span>
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-4 text-sm text-light/60"
            >
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-primary" />
                Free site survey
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-primary" />
                No hidden costs
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-primary" />
                25-year warranty
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;