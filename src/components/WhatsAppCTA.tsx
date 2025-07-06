import React from 'react';
import { MessageCircle } from 'lucide-react';

// Add gtag type declaration
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
  }
}

const gtag = typeof window !== 'undefined' ? window.gtag : undefined;

interface WhatsAppCTAProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  productName?: string;
  productCapacity?: number;
  context?: 'general' | 'product' | 'quote' | 'visit' | 'support' | 'custom';
  phoneNumber?: string;
  className?: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
  showIcon?: boolean;
  analyticsEvent?: string;
}

const messageTemplates = {
  general: "Hi Team Type3, I'm interested in your solar solutions. Please provide more information.",
  product: (productName: string, capacity?: number) => 
    `Hi Team Type3, I'm interested in the ${productName}${capacity ? ` (${capacity}kW)` : ''} solar solution. Please provide more details and a quote.`,
  quote: (productName?: string, capacity?: number) => 
    `Hi, I'd like a detailed quote for ${productName ? `the ${productName}` : 'solar installation'}${capacity ? ` (${capacity}kW)` : ''} for my property.`,
  visit: "Hi, I'd like to schedule a free site visit for solar installation consultation.",
  support: "Hi Team Type3, I need technical support for my solar system. Please assist.",
  custom: ""
};

export default function WhatsAppCTA({
  variant = 'primary',
  size = 'md',
  message,
  productName,
  productCapacity,
  context = 'general',
  phoneNumber = '918095508066',
  className = '',
  children,
  fullWidth = false,
  showIcon = true,
  analyticsEvent
}: WhatsAppCTAProps) {
  
  const generateMessage = () => {
    if (message) return message;
    
    switch (context) {
      case 'product':
        return messageTemplates.product(productName || 'solar solution', productCapacity);
      case 'quote':
        return messageTemplates.quote(productName, productCapacity);
      case 'visit':
        return messageTemplates.visit;
      case 'support':
        return messageTemplates.support;
      case 'custom':
        return messageTemplates.custom;
      default:
        return messageTemplates.general;
    }
  };

  const generateWhatsAppURL = () => {
    const msg = generateMessage();
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleClick = () => {
    if (analyticsEvent && gtag) {
      gtag('event', analyticsEvent, {
        event_category: 'WhatsApp',
        event_label: context,
        product_name: productName,
        product_capacity: productCapacity
      });
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary hover:bg-primary-hover active:bg-primary-active text-dark font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]';
      case 'secondary':
        return 'bg-[#25D366] hover:bg-[#22C55E] active:bg-[#16A34A] text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]';
      case 'ghost':
        return 'border-2 border-white/20 text-light hover:border-primary/50 hover:bg-primary/10 hover:text-primary font-medium backdrop-blur-sm';
      case 'floating':
        return 'bg-[#25D366] hover:bg-[#22C55E] text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 active:scale-95 animate-pulse hover:animate-none';
      default:
        return 'bg-primary hover:bg-primary-hover text-dark font-semibold';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm h-10';
      case 'lg':
        return 'px-8 py-4 text-lg h-14';
      default:
        return 'px-6 py-3 text-base h-12';
    }
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <a
          href={generateWhatsAppURL()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={`
            inline-flex items-center justify-center gap-2 rounded-full transition-all duration-300
            ${getVariantStyles()}
            ${size === 'sm' ? 'w-12 h-12' : 'w-14 h-14 md:w-auto md:px-4 md:rounded-xl'}
          `}
          aria-label="Contact us on WhatsApp"
        >
          {showIcon && <MessageCircle className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} />}
          {size === 'lg' && (
            <span className="hidden md:inline font-medium text-sm whitespace-nowrap">Chat with us</span>
          )}
        </a>
      </div>
    );
  }

  return (
    <a
      href={generateWhatsAppURL()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center gap-3 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
        ${getVariantStyles()} ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {showIcon && (
        <MessageCircle className={`
          ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}
        `} />
      )}
      
      {children || (
        <span>
          {context === 'quote' && 'Get Quote on WhatsApp'}
          {context === 'visit' && 'Schedule Visit'}
          {context === 'support' && 'Get Support'}
          {context === 'product' && 'Enquire on WhatsApp'}
          {context === 'general' && 'Chat on WhatsApp'}
          {context === 'custom' && 'Contact Us'}
        </span>
      )}
    </a>
  );
}
