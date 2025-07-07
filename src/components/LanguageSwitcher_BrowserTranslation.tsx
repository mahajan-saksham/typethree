import React, { useState } from 'react';
import { Globe } from 'lucide-react';

type Language = 'en' | 'hi';

interface BrowserTranslationNoticeProps {
  onDismiss: () => void;
}

const BrowserTranslationNotice: React.FC<BrowserTranslationNoticeProps> = ({ onDismiss }) => (
  <div className="fixed top-0 left-0 right-0 bg-primary text-dark p-3 z-50 text-center">
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium">
          🌐 For automatic translation, use your browser's built-in translate feature (right-click → Translate)
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="ml-4 text-dark hover:text-dark/70 font-bold text-lg"
      >
        ×
      </button>
    </div>
  </div>
);

export const LanguageSwitcher: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('hi'); // Hindi default to match content
  const [isOpen, setIsOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  
  const handleLanguageSwitch = (lang: Language) => {
    if (lang === 'en') {
      // Show notice about browser translation for English
      setShowNotice(true);
      // Auto-hide notice after 5 seconds
      setTimeout(() => setShowNotice(false), 5000);
    }
    
    setCurrentLang(lang);
    setIsOpen(false);
    
    // Add instructions for users
    if (lang === 'en') {
      // Try to trigger browser translation detection
      const html = document.documentElement;
      html.setAttribute('lang', 'hi'); // Set to Hindi to trigger browser translation
      
      // Add a small delay and show instructions
      setTimeout(() => {
        console.log('To translate to English: Right-click → Translate to English');
      }, 100);
    }
  };
  
  return (
    <>
      {showNotice && <BrowserTranslationNotice onDismiss={() => setShowNotice(false)} />}
      
      <div className="relative">
        {/* Custom language selector button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-colors duration-300 min-h-[36px]"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Globe className="w-4 h-4 mr-2 text-primary" />
          <span>{currentLang === 'en' ? 'English (Browser)' : 'हिन्दी'}</span>
          <span className="ml-2 text-primary text-xs">▼</span>
        </button>
        
        {/* Dropdown menu */}
        {isOpen && (
          <div 
            className="absolute top-full mt-1 left-0 bg-dark-800 border border-white/10 rounded-lg shadow-lg overflow-hidden z-50 min-w-[160px]"
          >
            <button
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                currentLang === 'hi' ? 'bg-primary text-black' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => handleLanguageSwitch('hi')}
            >
              हिन्दी (Original)
            </button>
            <button
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                currentLang === 'en' ? 'bg-primary text-black' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => handleLanguageSwitch('en')}
              title="Use browser translation for English"
            >
              English (Browser)
            </button>
          </div>
        )}
      </div>
    </>
  );
};
