import React from 'react';
import { UseCaseColors } from '../../data/products';

interface UseCaseBadgeProps {
  useCase: 'Residential' | 'Commercial' | 'Industrial';
  className?: string;
}

export const UseCaseBadge: React.FC<UseCaseBadgeProps> = ({ useCase, className = '' }) => {
  // Get the appropriate background color from the mapping
  const bgColor = UseCaseColors[useCase];
  
  return (
    <div 
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: bgColor, color: useCase === 'Residential' ? '#0A0A0A' : '#FFFFFF' }}
    >
      {useCase}
    </div>
  );
};

interface SubsidyBadgeProps {
  subsidyAmount: string;
  className?: string;
}

export const SubsidyBadge: React.FC<SubsidyBadgeProps> = ({ subsidyAmount, className = '' }) => {
  return (
    <div className={`flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      <span className="mr-1">🏷️</span>
      <span>MNRE Subsidy Available – {subsidyAmount}</span>
    </div>
  );
};
