import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from './Progress';

interface InvestmentProjectCardProps {
  id: string;
  name: string;
  location: string;
  capacity: number;
  targetInvestment: number;
  currentInvestment: number;
  estimatedROI: number;
  endDate: string;
  status: 'open' | 'almost_full' | 'upcoming' | 'closed';
  type: string;
  imageUrl?: string;
}

export const InvestmentProjectCard: React.FC<InvestmentProjectCardProps> = ({
  id,
  name,
  location,
  capacity,
  targetInvestment,
  currentInvestment,
  estimatedROI,
  endDate,
  status,
  type,
  imageUrl,
}) => {
  // Calculate funding percentage
  const calculateFundingPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Calculate days left until end date
  const calculateDaysLeft = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get status label and color
  const getStatusInfo = () => {
    switch (status) {
      case 'open':
        return { label: 'Open for Investment', classes: 'bg-green-500/20 text-green-400' };
      case 'almost_full':
        return { label: 'Almost Full', classes: 'bg-orange-500/20 text-orange-400' };
      case 'upcoming':
        return { label: 'Upcoming', classes: 'bg-blue-500/20 text-blue-400' };
      case 'closed':
        return { label: 'Closed', classes: 'bg-gray-500/20 text-gray-400' };
      default:
        return { label: 'Unknown', classes: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const statusInfo = getStatusInfo();
  const fundingPercentage = calculateFundingPercentage(currentInvestment, targetInvestment);
  const daysLeft = calculateDaysLeft(endDate);

  return (
    <div className="bg-dark-100 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 transform hover:-translate-y-1">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl || 'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/images/solar-default.jpg'} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-transparent to-dark-500/80"></div>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.classes}`}>
            {statusInfo.label}
          </span>
        </div>
        
        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-light/80 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-light/90">{location}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-xl text-light mb-1 line-clamp-1">{name}</h3>
        
        <div className="flex items-center space-x-2 mt-1 mb-3">
          <span className="inline-block px-2 py-1 bg-dark-200 text-light/80 rounded text-xs">
            {capacity} kW
          </span>
          <span className="inline-block px-2 py-1 bg-dark-200 text-light/80 rounded text-xs capitalize">
            {type.replace('_', ' ')}
          </span>
        </div>
        
        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <p className="text-xs font-medium text-light/70">Funding Progress</p>
            <p className="text-xs font-medium text-light/70">{fundingPercentage}%</p>
          </div>
          <Progress value={fundingPercentage} max={100} className="h-1.5 mb-1" />
          <div className="flex justify-between text-xs text-light/60">
            <p>₹{(currentInvestment / 100000).toFixed(1)}L raised</p>
            <p>₹{((targetInvestment - currentInvestment) / 100000).toFixed(1)}L to go</p>
          </div>
        </div>
        
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-dark-200 p-2 rounded">
            <p className="text-xs text-light/50">Est. ROI</p>
            <p className="text-sm font-semibold text-primary">{estimatedROI}%</p>
          </div>
          <div className="bg-dark-200 p-2 rounded">
            <p className="text-xs text-light/50">Min. Investment</p>
            <p className="text-sm font-semibold">₹10,000</p>
          </div>
        </div>
        
        {/* Days Left */}
        {status !== 'upcoming' && status !== 'closed' && (
          <div className="mb-4 flex items-center justify-between bg-dark-200 p-2 rounded">
            <span className="text-xs text-light/70">Time Left</span>
            <span className="text-sm font-semibold text-light">{daysLeft} days</span>
          </div>
        )}
        
        {/* CTA */}
        <Link 
          to={`/investment-projects/${id}`}
          className="block w-full text-center py-2.5 px-4 rounded bg-primary text-dark font-semibold hover:bg-primary/90 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
