import React from 'react';

interface ProgressProps {
  value: number;
  max: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, max, className = '' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  return (
    <div className={`w-full bg-dark-300 rounded-full overflow-hidden ${className}`}>
      <div 
        className="bg-primary" 
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      ></div>
    </div>
  );
};
