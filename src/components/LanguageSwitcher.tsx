import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

type Language = 'en' | 'hi';

export const LanguageSwitcher: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('en'); // English default
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle language switching using Google Translate API
  const switchLanguage = (lang: Language) => {
    // Find the Google Translate select element
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (selectElement) {
      // Change the selected language
      selectElement.value = lang;
      // Trigger the change event to apply translation
      selectElement.dispatchEvent(new Event('change'));
      // Update our UI state
      setCurrentLang(lang);
      setIsOpen(false);
    } else {
      // Fallback to direct cookie method if element not found
      const domain = window.location.hostname;
      document.cookie = `googtrans=/auto/${lang}; path=/; domain=.${domain}`;
      document.cookie = `googtrans=/auto/${lang}; path=/;`;
      setCurrentLang(lang);
      window.location.reload();
    }
  };
  
  // Check for Google Translate and set defaults
  useEffect(() => {
    // Function to check if Google Translate is loaded
    const checkForTranslate = () => {
      // If Google Translate is ready, set up initial state
      if (window.google?.translate) {
        // Check if we already have a language preference
        const hasLanguageCookie = document.cookie.includes('googtrans');
        
        if (!hasLanguageCookie) {
          // Set English as default on first visit
          setTimeout(() => switchLanguage('en'), 300);
        } else {
          // Detect current language from cookie
          const match = document.cookie.match(/googtrans=(\/auto\/)(\w+)/);
          if (match && match[2]) {
            setCurrentLang(match[2] as Language);
          }
        }
        return true;
      }
      return false;
    };
    
    // If Google Translate isn't loaded yet, check periodically
    if (!checkForTranslate()) {
      const interval = setInterval(() => {
        if (checkForTranslate()) {
          clearInterval(interval);
        }
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  return (
    <div className="relative">
      {/* Custom language selector button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-colors duration-300 min-h-[36px]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 mr-2 text-primary" />
        <span>{currentLang === 'en' ? 'English' : 'हिन्दी'}</span>
        <span className="ml-2 text-primary text-xs">▼</span>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute top-full mt-1 left-0 bg-dark-800 border border-white/10 rounded-lg shadow-lg overflow-hidden z-50 min-w-[120px]"
        >
          <button
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              currentLang === 'en' ? 'bg-primary text-black' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => switchLanguage('en')}
          >
            English
          </button>
          <button
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              currentLang === 'hi' ? 'bg-primary text-black' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => switchLanguage('hi')}
          >
            हिन्दी
          </button>
        </div>
      )}
    </div>
  );
};
