import React, { ReactNode } from 'react';

interface ProductGridProps {
  children: ReactNode;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {children}
      </div>
    </div>
  );
};

export default ProductGrid;
