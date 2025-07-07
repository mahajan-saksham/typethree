import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLanguageSwitch = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      {/* Custom language selector button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-colors duration-300 min-h-[36px]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 mr-2 text-primary" />
        <span>{language === 'en' ? 'ENGLISH' : 'हिन्दी'}</span>
        <span className="ml-2 text-primary text-xs">▼</span>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute top-full mt-1 left-0 bg-dark-800 border border-white/10 rounded-lg shadow-lg overflow-hidden z-50 min-w-[120px]"
        >
          <button
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              language === 'hi' ? 'bg-primary text-black font-medium' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => handleLanguageSwitch('hi')}
          >
            हिन्दी
          </button>
          <button
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              language === 'en' ? 'bg-primary text-black font-medium' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => handleLanguageSwitch('en')}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
};
