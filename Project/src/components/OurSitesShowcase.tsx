import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Zap, Wallet, BarChart, Leaf
} from 'lucide-react';

const projectData = [
  {
    id: 1,
    title: "Commercial Office Complex",
    location: "Gurugram, Commercial District",
    image: "https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/images/Our%20Designs/Commercial.png",
    co2Offset: "5.8 tons/year",
    systemSize: "250 kW",
    dailyAverage: "1,050 kWh",
    monthlySavings: "₹1,28,000",
    barData: [42, 46, 38, 50, 41, 43, 44],
    vsAverage: "+8%"
  },
  {
    id: 2,
    title: "Multi-Building Apartment Society",
    location: "Bengaluru, Tech Park",
    image: "https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/images/Our%20Designs/Building.png",
    co2Offset: "7.3 tons/year",
    systemSize: "175 kW",
    dailyAverage: "840 kWh",
    monthlySavings: "₹89,500",
    barData: [38, 42, 37, 45, 39, 40, 41],
    vsAverage: "+5%"
  },
  {
    id: 3,
    title: "Independent House Rooftop",
    location: "Delhi, South Extension",
    image: "https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/images/Our%20Designs/Home.png",
    co2Offset: "2.5 tons/year",
    systemSize: "10 kW",
    dailyAverage: "42 kWh",
    monthlySavings: "₹12,600",
    barData: [22, 24, 19, 25, 21, 20, 23],
    vsAverage: "+6%"
  },
  {
    id: 4,
    title: "Villa Pergola Installation",
    location: "Goa, Coastal Resort",
    image: "https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/images/Our%20Designs/Pool.png",
    co2Offset: "3.1 tons/year",
    systemSize: "15 kW",
    dailyAverage: "58 kWh",
    monthlySavings: "₹17,400",
    barData: [28, 31, 26, 33, 30, 29, 32],
    vsAverage: "+4%"
  }
];

const OurSitesShowcase: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = projectData.length;
  
  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [totalSlides]);
  
  const activeProject = projectData[currentSlide];
  
  // Navigation functions
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  
  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };
  
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Project Details & Stats */}
      <div 
        key={activeProject.id} // Key helps React re-render on project change
        className="order-2 lg:order-1 space-y-6"
      >
        <div className="mb-5">
          <h3 className="text-3xl lg:text-4xl font-bold text-light">
            {activeProject.title}
          </h3>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-[88px]">
            <div className="flex items-center gap-2 px-4 pt-4 mb-1">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-light/70 text-sm">System Size</span>
            </div>
            <p className="text-2xl font-bold text-light px-4 pb-4">{activeProject.systemSize}</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-[88px]">
            <div className="flex items-center gap-2 px-4 pt-4 mb-1">
              <Sun className="h-5 w-5 text-primary" />
              <span className="text-light/70 text-sm">Daily Average</span>
            </div>
            <p className="text-2xl font-bold text-light px-4 pb-4">{activeProject.dailyAverage}</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-[88px]">
            <div className="flex items-center gap-2 px-4 pt-4 mb-1">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-light/70 text-sm">Monthly Savings</span>
            </div>
            <p className="text-2xl font-bold text-light px-4 pb-4">{activeProject.monthlySavings}</p>
          </div>
        </div>
        
        {/* Energy Generation Graph */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <span className="text-light font-medium">Last 7 Days Energy Generation</span>
            </div>
            <span className="text-primary text-sm font-bold">{activeProject.vsAverage} vs avg</span>
          </div>
          
          {/* Energy Bar Chart */}
          <div className="h-32 flex items-end justify-between gap-2 mt-2">
            {activeProject.barData.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className="w-10 bg-primary/20 hover:bg-primary/30 transition-colors duration-300 rounded-t-sm relative group"
                  style={{ height: `${value * 2}px` }}
                >
                  <div 
                    className="absolute inset-x-0 bottom-0 bg-primary rounded-t-sm transition-all duration-300"
                    style={{ height: `${value * 0.7}px` }}
                  ></div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark-900 text-primary text-xs py-1 px-2 rounded pointer-events-none">{value} kWh</span>
                </div>
                <span className="text-light/50 text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Button removed */}
      </div>
      
      {/* Right Column: Image Carousel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="order-1 lg:order-2"
      >
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-dark-900/50">
          {/* Perfect Match Badge */}
          <div className="absolute top-6 right-6 bg-primary text-dark font-bold px-4 py-1.5 rounded-lg text-sm shadow-lg z-10 flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            <span>CO₂ offset: {activeProject.co2Offset}</span>
          </div>
          
          {/* Location Badge */}

          
          {/* Site title removed - already visible in the left panel */}
          
          {/* Images Carousel */}
          <div className="aspect-[4/3] relative">
            {/* Image Carousel */}
            <div className="relative w-full h-full">
              {projectData.map((project, index) => (
                <img 
                  key={project.id}
                  src={project.image}
                  alt={project.title}
                  className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${
                    currentSlide === index ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
            
            {/* Carousel Controls */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-4">
              {projectData.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-primary w-8' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={goToPrevSlide}
              className="absolute top-1/2 left-4 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-light hover:bg-black/70 transition-colors duration-300" 
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
            </button>
            <button 
              onClick={goToNextSlide}
              className="absolute top-1/2 right-4 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-light hover:bg-black/70 transition-colors duration-300" 
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OurSitesShowcase;
