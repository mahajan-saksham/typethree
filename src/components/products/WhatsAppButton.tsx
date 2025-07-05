import React from 'react';
import { generateWhatsAppLink } from '../../data/products';

interface WhatsAppButtonProps {
  productName: string;
  className?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ productName, className = '' }) => {
  const whatsappLink = generateWhatsAppLink(productName);
  
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#CCFF00] font-medium py-3 px-6 rounded-lg transition-colors duration-300 ${className}`}
    >
      <span className="mr-2">📩</span>
      <span>Get on WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
