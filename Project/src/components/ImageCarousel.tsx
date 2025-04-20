import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample carousel images for rooftop solar
const carouselImages = [
  {
    src: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/carousal//1.png',
    alt: 'Rooftop Solar',
    caption: 'Power your home with clean, affordable solar energy'
  },
  {
    src: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/carousal//6.png',
    alt: 'Modern home with solar panels',
    caption: 'Residential rooftop solar solutions with guaranteed ROI'
  },
  {
    src: 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/carousal//3.png',
    alt: 'Solar panel closeup',
    caption: 'Premium quality panels with 25+ year lifespan'
  },
];

export const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // Change image every 8 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={carouselImages[currentIndex].src} 
            alt={carouselImages[currentIndex].alt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation buttons */}
      <div className="absolute inset-x-0 top-1/2 flex justify-between items-center px-4 -translate-y-1/2 z-20">
        <button 
          onClick={goToPrevious}
          className="p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={goToNext}
          className="p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Dots indicator */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 z-20">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? 'bg-primary' : 'bg-white/40 hover:bg-white/60'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
