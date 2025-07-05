import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Wallet
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

// Generate variants based on product capacity
const generateVariants = (product: Product): ProductVariant[] => {
  const baseCapacity = parseFloat(product.capacity_kw || '3');
  const basePrice = product.price || 100000;
  
  // Define standard residential capacities
  const capacities = [1, 2, 3, 5, 10];
  
  return capacities.map(kw => {
    const priceMultiplier = kw / baseCapacity;
    const price = Math.round(basePrice * priceMultiplier);
    const subsidyAmount = product.subsidy_amount || Math.round(price * 0.3);
    const subsidized_price = price - subsidyAmount;
    
    return {
      capacity: `${kw}kW`,
      capacity_kw: kw,
      price: price,
      subsidized_price: subsidized_price,
      monthly_savings: Math.round((product.monthly_savings || 3000) * (kw / baseCapacity)),
      daily_units: kw * 4, // Assuming 4 units per kW per day
      area_required: kw * 100, // Assuming 100 sq ft per kW
      payback_period: Math.round(subsidized_price / (kw * 4 * 30 * 5)) // Simple payback calculation
    };
  });
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex] = useState(0);
  const [showROICalculator, setShowROICalculator] = useState(false);
  
  // Find the product
  const product = products.find(p => p.id === id);
  
  // Generate variants for the product
  const variants = product ? generateVariants(product) : [];
  
  // Set default variant
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      // Select variant closest to product's base capacity
      const baseCapacity = parseFloat(product?.capacity_kw || '3');
      const defaultVariant = variants.reduce((prev, curr) => 
        Math.abs(curr.capacity_kw - baseCapacity) < Math.abs(prev.capacity_kw - baseCapacity) ? curr : prev
      );
      setSelectedVariant(defaultVariant);
    }
  }, [variants, product, selectedVariant]);
  
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

  return (
    <div className="min-h-screen bg-dark">
      {/* Header with breadcrumb */}
      <div className="bg-darker border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center text-sm text-gray-400">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-light">{product.name}</span>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-darker rounded-xl overflow-hidden">
              <div className="aspect-square">
                <img 
                  src={productImages[selectedImageIndex] || product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=' + encodeURIComponent(product.name);
                  }}
                />
              </div>
              {/* Trust Badge */}
              <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">{product.warranty_years || 25} Year Warranty</span>
                </div>
              </div>
            </div>

          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-light mb-2">
                {product.name}
              </h1>
              <p className="text-gray-400 text-lg">
                {product.description || product.short_description || 
                 `High-efficiency ${product.capacity || '3kW'} solar system perfect for ${product.useCase?.toLowerCase() || 'residential'} use.`}
              </p>
            </div>
            

            
            {/* Price Section */}
            {selectedVariant && (
              <div className="bg-darker rounded-xl p-6 space-y-4">
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-light">
                      {formatCurrency(selectedVariant.subsidized_price)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(selectedVariant.price)}
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-medium">
                      Save {Math.round(((selectedVariant.price - selectedVariant.subsidized_price) / selectedVariant.price) * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    After government subsidy of {formatCurrency(selectedVariant.price - selectedVariant.subsidized_price)}
                  </p>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">EMI starts at</span>
                    <span className="text-light font-medium">
                      {formatCurrency(calculateEMI(selectedVariant.subsidized_price))}/month
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    *For 5 year tenure at 8% interest rate
                  </p>
                </div>
              </div>
            )}
            
            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 rounded-lg p-2">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-light font-medium">Daily Generation</p>
                  <p className="text-gray-400 text-sm">
                    {selectedVariant?.daily_units || 12} units/day
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 rounded-lg p-2">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-light font-medium">Monthly Savings</p>
                  <p className="text-gray-400 text-sm">
                    {formatCurrency(selectedVariant?.monthly_savings || 3000)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 rounded-lg p-2">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-light font-medium">Area Required</p>
                  <p className="text-gray-400 text-sm">
                    {selectedVariant?.area_required || 300} sq.ft
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 rounded-lg p-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-light font-medium">Installation Time</p>
                  <p className="text-gray-400 text-sm">
                    {product.installation_time || '3-4 days'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="space-y-3">

              
              <button 
                onClick={() => setShowROICalculator(true)}
                className="w-full bg-darker border border-gray-700 text-light px-6 py-3 rounded-lg font-medium hover:border-gray-600 transition-all flex items-center justify-center gap-2"
              >
                Calculate Your Savings
                <Info className="w-4 h-4" />
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="border-t border-gray-700 pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-400">25 Year Warranty</p>
                </div>
                <div>
                  <Sun className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Premium Panels</p>
                </div>
                <div>
                  <Leaf className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Eco Friendly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Features Section */}
        {product.features && product.features.length > 0 && (
          <div className="mt-12 bg-darker rounded-xl p-8">
            <h2 className="text-2xl font-bold text-light mb-6">Product Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Technical Specifications */}
        <div className="mt-8 bg-darker rounded-xl p-8">
          <h2 className="text-2xl font-bold text-light mb-6">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">System Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-400">System Type</dt>
                  <dd className="text-light font-medium">{product.product_type?.replace('-', ' ').toUpperCase() || 'On-Grid'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Capacity</dt>
                  <dd className="text-light font-medium">{selectedVariant?.capacity || product.capacity}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Daily Generation</dt>
                  <dd className="text-light font-medium">{selectedVariant?.daily_units || 12} units</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Annual Generation</dt>
                  <dd className="text-light font-medium">{(selectedVariant?.daily_units || 12) * 365} units</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Installation Requirements</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Roof Area Required</dt>
                  <dd className="text-light font-medium">{selectedVariant?.area_required || 300} sq.ft</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Installation Time</dt>
                  <dd className="text-light font-medium">{product.installation_time || '3-4 days'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Suitable For</dt>
                  <dd className="text-light font-medium">{product.useCase || 'Residential'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Warranty Period</dt>
                  <dd className="text-light font-medium">{product.warranty_years || 25} Years</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        {/* ROI Calculator Modal */}
        {showROICalculator && selectedVariant && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-darker rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-light mb-4">ROI Calculator</h3>
              
              <div className="space-y-4">
                <div className="bg-dark rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Total Investment</p>
                  <p className="text-2xl font-bold text-light">
                    {formatCurrency(selectedVariant.subsidized_price)}
                  </p>
                </div>
                
                <div className="bg-dark rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Monthly Savings</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedVariant.monthly_savings)}
                  </p>
                </div>
                
                <div className="bg-dark rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Payback Period</p>
                  <p className="text-2xl font-bold text-light">
                    {selectedVariant.payback_period} Years
                  </p>
                </div>
                
                <div className="bg-dark rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">25 Year Savings</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(selectedVariant.monthly_savings * 12 * 25)}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowROICalculator(false)}
                className="mt-6 w-full bg-primary text-dark px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Close Calculator
              </button>
            </div>
          </div>
        )}
      </div>
      

    </div>
  );
};

export default ProductDetail;