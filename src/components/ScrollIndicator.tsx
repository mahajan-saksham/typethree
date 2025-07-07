import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
  showAlways?: boolean;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ 
  containerRef, 
  className = '',
  showAlways = false 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const scrollable = container.scrollWidth > container.clientWidth;
      setIsScrollable(scrollable);
      
      if (!scrollable) {
        setIsVisible(false);
        return;
      }

      // Count visible items based on container width and item width
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      const firstChild = children[0];
      const itemWidth = firstChild.offsetWidth;
      const gap = parseInt(getComputedStyle(container).gap) || 16;
      const containerWidth = container.clientWidth;
      
      // Calculate how many items are visible at once
      const visibleItems = Math.floor(containerWidth / (itemWidth + gap));
      const totalPages = Math.max(1, children.length - visibleItems + 1);
      
      setTotalItems(Math.min(totalPages, 5)); // Max 5 indicators
    };

    const handleScroll = () => {
      if (!container) return;
      
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      const firstChild = children[0];
      const itemWidth = firstChild.offsetWidth;
      const gap = parseInt(getComputedStyle(container).gap) || 16;
      const scrollLeft = container.scrollLeft;
      
      // Calculate which "page" we're on
      const currentPage = Math.round(scrollLeft / (itemWidth + gap));
      const containerWidth = container.clientWidth;
      const visibleItems = Math.floor(containerWidth / (itemWidth + gap));
      const totalPages = Math.max(1, children.length - visibleItems + 1);
      
      const normalizedIndex = Math.min(Math.max(0, currentPage), totalPages - 1);
      const indicatorIndex = Math.floor((normalizedIndex / (totalPages - 1)) * (totalItems - 1));
      
      setActiveIndex(Math.min(indicatorIndex, totalItems - 1));
      setIsVisible(true);
    };

    // Initial check
    checkScrollable();
    handleScroll();

    // Event listeners
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollable);

    // Use ResizeObserver for better detection of size changes
    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
      resizeObserver.disconnect();
    };
  }, [containerRef, totalItems]);

  // Auto-hide after inactivity
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible, activeIndex]);

  if (!isScrollable && !showAlways) return null;
  if (totalItems <= 1) return null;

  return (
    <AnimatePresence>
      {(isVisible || showAlways) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`flex justify-center items-center gap-2 mt-4 ${className}`}
        >
          {Array.from({ length: totalItems }).map((_, index) => (
            <motion.div
              key={index}
              className={`transition-all duration-300 ${
                index === activeIndex 
                  ? 'w-6 h-1.5 bg-primary rounded-full shadow-lg' 
                  : 'w-1.5 h-1.5 bg-white/30 rounded-full backdrop-blur-sm border border-white/10'
              }`}
              animate={{
                scale: index === activeIndex ? 1 : 0.8,
                opacity: index === activeIndex ? 1 : 0.6
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                boxShadow: index === activeIndex 
                  ? '0 0 8px rgba(204, 255, 0, 0.4)' 
                  : 'none'
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Alternative vertical line indicator for different layouts
export const ScrollIndicatorLines: React.FC<ScrollIndicatorProps> = ({ 
  containerRef, 
  className = '',
  showAlways = false 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const scrollable = container.scrollWidth > container.clientWidth;
      setIsScrollable(scrollable);
      
      if (!scrollable) {
        setIsVisible(false);
        return;
      }

      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      setTotalItems(Math.min(children.length, 6)); // Max 6 lines
    };

    const handleScroll = () => {
      if (!container) return;
      
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      
      if (maxScroll > 0) {
        const scrollProgress = scrollLeft / maxScroll;
        const index = Math.round(scrollProgress * (totalItems - 1));
        setActiveIndex(Math.min(Math.max(0, index), totalItems - 1));
        setIsVisible(true);
      }
    };

    checkScrollable();
    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollable);

    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
      resizeObserver.disconnect();
    };
  }, [containerRef, totalItems]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible, activeIndex]);

  if (!isScrollable && !showAlways) return null;
  if (totalItems <= 1) return null;

  return (
    <AnimatePresence>
      {(isVisible || showAlways) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`flex justify-center items-center gap-1 mt-4 ${className}`}
        >
          {Array.from({ length: totalItems }).map((_, index) => (
            <motion.div
              key={index}
              className={`transition-all duration-300 ${
                index === activeIndex 
                  ? 'w-0.5 h-4 bg-primary rounded-full shadow-lg' 
                  : 'w-0.5 h-2 bg-white/30 rounded-full backdrop-blur-sm'
              }`}
              animate={{
                scaleY: index === activeIndex ? 1 : 0.6,
                opacity: index === activeIndex ? 1 : 0.5
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                boxShadow: index === activeIndex 
                  ? '0 0 6px rgba(204, 255, 0, 0.4)' 
                  : 'none'
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};