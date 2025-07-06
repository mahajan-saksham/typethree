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
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[600px]">
            
            {/* Product Image - Expanded */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative bg-dark-100/40 rounded-3xl p-4 min-h-[600px] flex items-center">
                <img 
                  src={productImages[selectedImageIndex] || product.image_url} 
                  alt={product.name}
                  className="w-full h-auto max-h-[550px] object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                
                {/* Warranty Badge */}
                <div className="absolute top-6 right-6 bg-primary/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <div className="flex items-center gap-3 text-primary">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="font-semibold text-lg">{product.warranty_years || 25} Year Warranty</span>
                  </div>
                </div>

                {/* Capacity Display */}
                <div className="absolute bottom-8 left-8">
                  <div className="bg-dark/80 backdrop-blur-sm rounded-xl px-8 py-6">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {selectedVariant?.capacity || product.capacity || '3kW'}
                    </div>
                    <div className="text-lg text-gray-400">System Capacity</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {product.description || 'Complete solar power system with high-efficiency panels, inverter, mounting structure, and performance warranty. Perfect for residential and commercial applications.'}
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-dark-100/40 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-400 line-through">
                      {formatCurrency(selectedVariant?.price || product.price || 0)}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(selectedVariant?.subsidized_price || product.sale_price || 0)}
                    </div>
                    <div className="text-sm text-success">
                      After government subsidy of ₹{((selectedVariant?.price || 0) - (selectedVariant?.subsidized_price || 0)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">EMI starts at</div>
                    <div className="text-xl font-bold text-primary">
                      ₹{calculateEMI(selectedVariant?.subsidized_price || 0).toLocaleString()}/month
                    </div>
                    <div className="text-xs text-gray-400">*For 5 year tenure at 8% interest rate</div>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary-hover text-dark font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Get Quote
                  </a>
                  <button
                    onClick={() => setShowROICalculator(!showROICalculator)}
                    className="border border-primary text-primary hover:bg-primary/10 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Calculate Savings
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose Our Solar Systems?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of energy with our cutting-edge solar technology, designed for maximum efficiency, durability, and savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-100/40 rounded-2xl p-6 hover:bg-dark-100/60 transition-all duration-300"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
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

      {/* Final CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl p-12 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Go Solar?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have already made the switch to clean, renewable energy. 
              Start saving money and the environment today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-hover text-dark font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center gap-2 text-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Get Free Quote Now
              </a>
              
              <a
                href="tel:+918095508066"
                className="border border-primary text-primary hover:bg-primary/10 font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center gap-2 text-lg"
              >
                <Phone className="w-5 h-5" />
                Call: +91 80955 08066
              </a>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              Free site survey • No hidden costs • 25-year warranty
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;