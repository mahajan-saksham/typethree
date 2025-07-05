// Product types and data for Type 3 Solar Platform
export interface Product {
  id: string;
  name: string;
  capacity?: string;
  capacity_kw?: string;
  dailyOutput?: string;
  priceRange?: string;
  price?: number;
  sale_price?: number;
  hasSubsidy?: boolean;
  subsidy_percentage?: number;
  subsidy_amount?: number;
  subsidyAmount?: string;
  features?: string[];
  useCase?: 'Residential' | 'Commercial' | 'Industrial';
  use_cases?: string[];
  category?: string;
  description?: string;
  short_description?: string;
  monthly_savings?: number;
  targetAudience?: string;
  image_url?: string;
  images?: string[];
  warranty_years?: number;
  installation_time?: string;
  product_type?: string;
}

// Color mapping for use cases
export const UseCaseColors = {
  Residential: '#CCFF00',
  Commercial: '#00D4FF',
  Industrial: '#FF7E36',
};

// Product type categories for filtering
export const ProductTypes = {
  'on-grid': 'On-Grid Solar Systems',
  'off-grid': 'Off-Grid Solar Systems',
  'hybrid': 'Hybrid Solar Systems',
  'water-heater': 'Solar Water Heaters',
  'street-light': 'Solar Street Lights',
  'decorative': 'Solar Decorative Lights',
  'water-pump': 'Solar Water Pumps',
  'electric-fence': 'Solar Electric Fences'
};
// Enhanced product data from Type3Solar catalog
export const products: Product[] = [
  // ON-GRID SOLAR SYSTEMS
  {
    id: 'ONGRID-1KW-001',
    name: '1KW On-Grid Solar System',
    capacity: '1 kW',
    capacity_kw: '1',
    dailyOutput: '4 units/day',
    price: 89000,
    sale_price: 69000,
    hasSubsidy: true,
    subsidy_percentage: 30,
    subsidy_amount: 20000,
    subsidyAmount: 'Up to ₹20,000',
    monthly_savings: 1500,
    warranty_years: 25,
    installation_time: '3-4 days',
    features: [
      'High-efficiency solar panels',
      '1kW grid-tie inverter',
      'Mounting structure included',
      '25-year performance warranty',
      'Mobile monitoring app'
    ],
    useCase: 'Residential',
    category: 'residential',
    product_type: 'on-grid',
    description: 'Complete 1kW on-grid solar power system with high-efficiency panels, 1kW inverter, mounting structure, and 25-year performance warranty. Generates approximately 4 units daily. Save ₹1,500 monthly on electricity bills in Indore.',
    short_description: 'Entry-level on-grid system for small homes',
    targetAudience: 'Small homes and apartments',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/1kW%20off-grid%20solar%20system.png',
    images: [
      'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/1kW%20off-grid%20solar%20system.png'
    ]
  },
  {
    id: 'ONGRID-2KW-001',
    name: '2KW On-Grid Solar System',
    capacity: '2 kW',
    capacity_kw: '2',
    dailyOutput: '8 units/day',
    price: 139000,
    sale_price: 99000,
    hasSubsidy: true,
    subsidy_percentage: 35,
    subsidy_amount: 40000,
    subsidyAmount: 'Up to ₹40,000',
    monthly_savings: 3000,
    warranty_years: 25,
    installation_time: '3-4 days',    features: [
      'High-efficiency solar panels',
      '2kW grid-tie inverter',
      'Mounting structure included',
      '25-year performance warranty',
      'Mobile monitoring app'
    ],
    useCase: 'Residential',
    category: 'residential',
    product_type: 'on-grid',
    description: 'Complete 2kW on-grid solar power system with high-efficiency panels, 2kW inverter, mounting structure, and 25-year performance warranty. Generates approximately 8 units daily. Save ₹3,000 monthly on electricity bills.',
    short_description: 'Perfect for small to medium homes',
    targetAudience: 'Small to medium homes',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/2kW%20off-grid%20solar%20system.png',
    images: [
      'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/2kW%20off-grid%20solar%20system.png'
    ]
  },
  {
    id: 'ONGRID-3KW-001',
    name: '3KW On-Grid Solar System',
    capacity: '3 kW',
    capacity_kw: '3',
    dailyOutput: '12 units/day',
    price: 205000,
    sale_price: 127000,
    hasSubsidy: true,
    subsidy_percentage: 38,
    subsidy_amount: 78000,
    subsidyAmount: 'Up to ₹78,000',
    monthly_savings: 4500,
    warranty_years: 25,
    installation_time: '3-4 days',
    features: [
      'High-efficiency solar panels',
      '3kW grid-tie inverter',
      'Mounting structure included',
      '25-year performance warranty',
      'Mobile monitoring app',
      'Maximum government subsidy'
    ],
    useCase: 'Residential',
    category: 'residential',
    product_type: 'on-grid',
    description: 'Complete 3kW on-grid solar power system with high-efficiency panels, 3kW inverter, mounting structure, and 25-year performance warranty. Generates approximately 12 units daily. Save ₹4,500 monthly on electricity bills.',
    short_description: 'Most popular choice for families',
    targetAudience: 'Medium to large families',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/3kW%20off-grid%20solar%20system.png',    images: [
      'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/3kW%20off-grid%20solar%20system.png'
    ]
  },
  {
    id: 'ONGRID-5KW-001',
    name: '5KW On-Grid Solar System',
    capacity: '5 kW',
    capacity_kw: '5',
    dailyOutput: '20 units/day',
    price: 325000,
    sale_price: 225000,
    hasSubsidy: true,
    subsidy_percentage: 31,
    subsidy_amount: 100000,
    subsidyAmount: 'Up to ₹1,00,000',
    monthly_savings: 7500,
    warranty_years: 25,
    installation_time: '4-5 days',
    features: [
      'Premium solar panels',
      '5kW grid-tie inverter',
      'Heavy-duty mounting structure',
      '25-year performance warranty',
      'Smart monitoring system',
      'Net metering ready'
    ],
    useCase: 'Residential',
    category: 'residential',
    product_type: 'on-grid',
    description: 'Complete 5kW on-grid solar power system with high-efficiency panels, 5kW inverter, mounting structure, and 25-year performance warranty. Generates approximately 20 units daily. Save ₹7,500 monthly on electricity bills.',
    short_description: 'Premium solution for large homes',
    targetAudience: 'Large homes and villas',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/5kW%20off-grid%20solar%20system.png'
  },
  
  // OFF-GRID SOLAR SYSTEMS
  {
    id: 'OFFGRID-1KW-001',
    name: '1KW Off-Grid Solar System',
    capacity: '1 kW',
    capacity_kw: '1',
    dailyOutput: '4 units/day',
    price: 58900,
    sale_price: 48900,
    hasSubsidy: true,
    subsidy_percentage: 17,
    subsidy_amount: 10000,    subsidyAmount: 'Up to ₹10,000',
    monthly_savings: 1200,
    warranty_years: 25,
    installation_time: '3-4 days',
    features: [
      'Solar panels with battery storage',
      '1kW off-grid inverter',
      'Battery backup system',
      'Complete independence from grid',
      'Perfect for remote locations'
    ],
    useCase: 'Residential',
    category: 'residential',
    product_type: 'off-grid',
    description: 'Complete 1kW off-grid solar power system with high-efficiency panels, 1kW inverter, battery storage, and mounting structure. Generates approximately 4 units daily with backup power capability.',
    short_description: 'Grid-independent power solution',
    targetAudience: 'Remote locations, backup power',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/1kW%20off-grid%20solar%20system.png'
  },
  
  // HYBRID SOLAR SYSTEMS
  {
    id: 'HYBRID-2KW-001',
    name: '2KW Hybrid Solar System',
    capacity: '2 kW',
    capacity_kw: '2',
    dailyOutput: '8 units/day',
    price: 99000,
    sale_price: 89000,
    hasSubsidy: true,
    subsidy_percentage: 10,
    subsidy_amount: 10000,
    subsidyAmount: 'Up to ₹10,000',
    monthly_savings: 2800,
    warranty_years: 25,
    installation_time: '4-5 days',
    features: [
      'Grid-tied with battery backup',
      'Seamless power switching',
      'Smart energy management',
      'Best of both worlds',
      'Mobile app monitoring'
    ],
    useCase: 'Residential',
    category: 'residential',
    product_type: 'hybrid',
    description: 'Complete 2kW hybrid solar power system combining grid-tied and battery backup features. Best of both worlds with grid connection and energy storage capability.',
    short_description: 'Grid + Battery backup solution',
    targetAudience: 'Homes wanting reliability',    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Hybrid%20Solar%20System/2kW%20hybrid%20solar%20system.png'
  },
  
  // SOLAR WATER HEATERS
  {
    id: 'HEATER-100LPD-001',
    name: '100LPD Solar Water Heater',
    capacity: '100 LPD',
    capacity_kw: '100LPD',
    price: 19900,
    sale_price: 17900,
    hasSubsidy: true,
    subsidy_percentage: 10,
    subsidy_amount: 2000,
    subsidyAmount: 'Up to ₹2,000',
    monthly_savings: 800,
    warranty_years: 15,
    installation_time: '1-2 days',
    features: [
      'Evacuated tube collectors',
      'Insulated storage tank',
      'Hot water for 3-4 members',
      '80% electricity savings',
      'Works in all weather'
    ],
    useCase: 'Residential',
    category: 'residential',
    product_type: 'water-heater',
    description: 'High-efficiency 100 LPD (Liters Per Day) solar water heater system with evacuated tube collectors and insulated storage tank. Reduces electricity costs by up to 80% for water heating.',
    short_description: 'Eco-friendly hot water solution',
    targetAudience: 'Small families (3-4 members)',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Water%20heater/100%20LPD%20solar%20water%20heater.png'
  },
  
  // SOLAR STREET LIGHTS
  {
    id: 'STREET-20W-001',
    name: '20W Solar Street Light',
    capacity: '20W',
    capacity_kw: '20W',
    price: 18900,
    sale_price: 16900,
    hasSubsidy: false,
    subsidy_percentage: 0,
    subsidy_amount: 0,
    monthly_savings: 500,
    warranty_years: 10,
    installation_time: '1 day',
    features: [      'Automatic dusk-to-dawn operation',
      'Motion sensor included',
      '8-10 hours continuous lighting',
      'Weather-resistant IP65',
      'Zero electricity bills'
    ],
    useCase: 'Commercial',
    category: 'commercial',
    product_type: 'street-light',
    description: 'High-efficiency 20W LED solar street light with automatic dusk-to-dawn operation and motion sensor. Provides 8-10 hours of continuous lighting after full charge.',
    short_description: 'Smart outdoor lighting solution',
    targetAudience: 'Gardens, pathways, streets',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/%20Solar%20street%20light%20/20W%20solar%20street%20light.png'
  },
  
  // COMMERCIAL SOLAR SYSTEMS
  {
    id: 'ONGRID-10KW-001',
    name: '10KW Commercial Solar System',
    capacity: '10 kW',
    capacity_kw: '10',
    dailyOutput: '40 units/day',
    price: 650000,
    sale_price: 472000,
    hasSubsidy: true,
    subsidy_percentage: 27,
    subsidy_amount: 178000,
    subsidyAmount: 'Up to ₹1.78 Lakh',
    monthly_savings: 15000,
    warranty_years: 25,
    installation_time: '5-7 days',
    features: [
      'Commercial-grade panels',
      'Three-phase inverter system',
      'Advanced monitoring system',
      'Net metering compatible',
      'Ideal ROI for businesses'
    ],
    useCase: 'Commercial',
    category: 'commercial',
    product_type: 'on-grid',
    description: 'Complete 10kW on-grid solar power system with high-efficiency panels, 10kW inverter, mounting structure, and 25-year performance warranty. Ideal for large homes and small commercial establishments.',
    short_description: 'Perfect for small businesses',
    targetAudience: 'Small businesses, large homes',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/On-Grid%20Solar%20Systems/10kW%20On-Grid%20Solar%20System.png'
  },  
  // INDUSTRIAL SOLAR SYSTEMS
  {
    id: 'ONGRID-20KW-001',
    name: '20KW Industrial Solar System',
    capacity: '20 kW',
    capacity_kw: '20',
    dailyOutput: '80 units/day',
    price: 1290000,
    sale_price: 940000,
    hasSubsidy: true,
    subsidy_percentage: 27,
    subsidy_amount: 350000,
    subsidyAmount: 'Up to ₹3.5 Lakh',
    monthly_savings: 30000,
    warranty_years: 25,
    installation_time: '10-14 days',
    features: [
      'Industrial-grade solar array',
      'High-capacity inverter system',
      'SCADA monitoring',
      'Maximum energy generation',
      'Rapid ROI for industries'
    ],
    useCase: 'Industrial',
    category: 'industrial',
    product_type: 'on-grid',
    description: 'Complete 20kW on-grid solar power system with high-efficiency panels, 20kW inverter, mounting structure, and 25-year performance warranty. Perfect for commercial and industrial applications.',
    short_description: 'Industrial-scale power generation',
    targetAudience: 'Factories, warehouses, large commercial',
    image_url: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/On-Grid%20Solar%20Systems/20kW%20On-Grid%20Solar%20System.png'
  }
];

// WhatsApp integration utility
export const generateWhatsAppLink = (productName: string): string => {
  const phoneNumber = '918095508066';
  const message = `Hi Team Type3, I'm interested in the ${productName} solar solution. Please provide more details.`;
  
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

// Get products by type
export const getProductsByType = (type: string): Product[] => {
  return products.filter(product => product.product_type === type);
};

// Get products by use case
export const getProductsByUseCase = (useCase: string): Product[] => {
  return products.filter(product => product.useCase === useCase);
};