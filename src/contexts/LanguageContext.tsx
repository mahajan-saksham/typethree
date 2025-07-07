import React, { createContext, useContext, useState, useEffect } from 'react';

// Language type
export type Language = 'hi' | 'en';

// Translation interface
interface Translations {
  // Hero section
  hero: {
    title: string;
    subtitle: string;
    features: {
      returns: string;
      warranty: string;
      emi: string;
      subsidy: string;
    };
    cta: string;
  };
  
  // Navigation
  nav: {
    home: string;
    products: string;
    about: string;
  };
  
  // Benefits section
  benefits: {
    title: string;
    items: {
      experience: string;
      warranty: string;
      quality: string;
      finance: string;
      service: string;
      financing: string;
      weatherproof: string;
      insurance: string;
    };
  };
  
  // How it works section
  howItWorks: {
    title: string;
    subtitle: string;
    steps: {
      step1: {
        title: string;
        description: string;
        tags: string[];
      };
      step2: {
        title: string;
        description: string;
        tags: string[];
      };
      step3: {
        title: string;
        description: string;
        tags: string[];
      };
    };
  };
  
  // Products section
  products: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
  
  // Common terms
  common: {
    monthlyRupees: string;
    years: string;
    details: string;
    monthlySavings: string;
    warranty: string;
  };
}

// Hindi translations (original content)
const hindiTranslations: Translations = {
  hero: {
    title: "अपनी छत को बनाएं कमाई का ज़रिया",
    subtitle: "सोलर प्रोडक्ट्स से 90% तक बिजली बिल बचाएं और ग्रिड को बिजली देकर पैसे कमाएँ",
    features: {
      returns: "15% तक सालाना रिटर्न्स",
      warranty: "25+ साल की वारंटी",
      emi: "आसान मासिक EMI",
      subsidy: "₹78,000 तक की सब्सिडी"
    },
    cta: "Explore Products"
  },
  
  nav: {
    home: "Home",
    products: "Products", 
    about: "About"
  },
  
  benefits: {
    title: "Get with Type 3",
    items: {
      experience: "30+ Years experience",
      warranty: "25 Years warranty",
      quality: "Reliable quality",
      finance: "Easy Finance Options",
      service: "Lifetime Service",
      financing: "Easy Financing",
      weatherproof: "All Weather Proof",
      insurance: "Insurance Cover"
    }
  },
  
  howItWorks: {
    title: "यह कैसे काम करता है",
    subtitle: "सोलर अपनाने के 3 आसान चरण",
    steps: {
      step1: {
        title: "मुफ्त विजिट बुक करें",
        description: "हम आपके घर आते हैं। बिना किसी शुल्क के। आपकी छत का निरीक्षण करके सही सोलर सिस्टम का सुझाव देते हैं।",
        tags: ["Free Consultation", "At Home Visit"]
      },
      step2: {
        title: "सही सिस्टम चुनें",
        description: "हम आपकी छत के आकार, आपकी बिजली की जरूरतों और बजट के हिसाब से सही सोलर सिस्टम का सुझाव देते हैं।",
        tags: ["Custom Solutions", "Budget Friendly"]
      },
      step3: {
        title: "इंस्टॉलेशन और शुरुआत",
        description: "हमारी एक्सपर्ट टीम आपके घर पर सोलर सिस्टम इंस्टॉल करती है और आपको इसका पूरा प्रशिक्षण देती है।",
        tags: ["Expert Installation", "Complete Training"]
      }
    }
  },
  
  products: {
    title: "Suggested Products",
    subtitle: "Tailored solutions for your solar energy needs",
    viewAll: "View All Products"
  },
  
  common: {
    monthlyRupees: "₹",
    years: "Years",
    details: "Details",
    monthlySavings: "Monthly Savings",
    warranty: "Warranty"
  }
};

// English translations
const englishTranslations: Translations = {
  hero: {
    title: "Turn Your Roof Into an Earning Source",
    subtitle: "Save up to 90% on electricity bills with solar products and earn money by selling electricity to the grid",
    features: {
      returns: "Up to 15% Annual Returns",
      warranty: "25+ Year Warranty",
      emi: "Easy Monthly EMI",
      subsidy: "Subsidy up to ₹78,000"
    },
    cta: "Explore Products"
  },
  
  nav: {
    home: "Home",
    products: "Products",
    about: "About"
  },
  
  benefits: {
    title: "Get with Type 3",
    items: {
      experience: "30+ Years experience",
      warranty: "25 Years warranty", 
      quality: "Reliable quality",
      finance: "Easy Finance Options",
      service: "Lifetime Service",
      financing: "Easy Financing",
      weatherproof: "All Weather Proof",
      insurance: "Insurance Cover"
    }
  },
  
  howItWorks: {
    title: "How It Works",
    subtitle: "3 Simple Steps to Adopt Solar",
    steps: {
      step1: {
        title: "Book Free Site Visit",
        description: "We come to your home. Free of charge. We inspect your roof and suggest the right solar system for you.",
        tags: ["Free Consultation", "At Home Visit"]
      },
      step2: {
        title: "Choose the Right System",
        description: "We suggest the right solar system based on your roof size, electricity needs, and budget.",
        tags: ["Custom Solutions", "Budget Friendly"]
      },
      step3: {
        title: "Installation and Start",
        description: "Our expert team installs the solar system at your home and provides you with complete training.",
        tags: ["Expert Installation", "Complete Training"]
      }
    }
  },
  
  products: {
    title: "Suggested Products",
    subtitle: "Tailored solutions for your solar energy needs",
    viewAll: "View All Products"
  },
  
  common: {
    monthlyRupees: "₹",
    years: "Years", 
    details: "Details",
    monthlySavings: "Monthly Savings",
    warranty: "Warranty"
  }
};

// Language context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hi'); // Default to Hindi
  
  // Get translations based on current language
  const translations = language === 'hi' ? hindiTranslations : englishTranslations;
  
  // Save language preference to localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('type3-language') as Language;
    if (savedLanguage && (savedLanguage === 'hi' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('type3-language', language);
    // Update document language attribute for accessibility
    document.documentElement.setAttribute('lang', language === 'hi' ? 'hi-IN' : 'en-US');
  }, [language]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
