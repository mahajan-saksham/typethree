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
    cta: string;
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
  
  // Calculator section
  calculator: {
    title: string;
    subtitle: string;
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
    cta: "अभी मुफ्त साइट विजिट बुक करें"
  },
  
  nav: {
    home: "Home",
    products: "Products", 
    about: "About"
  },
  
  benefits: {
    title: "Type 3 के साथ मिलता है",
    items: {
      experience: "30+ वर्षों का अनुभव",
      warranty: "25 साल की वारंटी",
      quality: "भरोसेमंद गुणवत्ता",
      finance: "आसान वित्तीय विकल्प",
      service: "जीवनभर सेवा",
      financing: "आसान वित्तीयन",
      weatherproof: "सभी मौसमों में सुरक्षित",
      insurance: "बीमा कवरेज"
    }
  },
  
  howItWorks: {
    title: "यह कैसे काम करता है",
    subtitle: "सोलर अपनाने के 3 आसान चरण",
    cta: "Explore Products",
    steps: {
      step1: {
        title: "मुफ्त विजिट बुक करें",
        description: "हम आपके घर आते हैं। बिना किसी शुल्क के। आपकी छत का निरीक्षण करके सही सोलर सिस्टम का सुझाव देते हैं।",
        tags: ["मुफ्त सलाह", "घर आकर विजिट"]
      },
      step2: {
        title: "सही सिस्टम चुनें",
        description: "हम आपकी छत के आकार, आपकी बिजली की जरूरतों और बजट के हिसाब से सही सोलर सिस्टम का सुझाव देते हैं।",
        tags: ["कस्टम समाधान", "बजट फ्रेंडली"]
      },
      step3: {
        title: "इंस्टॉलेशन और देखभाल",
        description: "प्रोफेशनल इंस्टॉलेशन और आजीवन देखभाल। हमारी कुशल टीम आपके सोलर सिस्टम को स्थापित करती है और उसकी निरंतर देखभाल सुनिश्चित करती है।",
        tags: ["एक्सपर्ट इंस्टॉलेशन", "आजीवन सपोर्ट"]
      }
    }
  },
  
  products: {
    title: "सुझाए गए उत्पाद",
    subtitle: "आपकी सौर ऊर्जा आवश्यकताओं के लिए अनुकूलित समाधान",
    viewAll: "सभी उत्पाद देखें"
  },
  
  calculator: {
    title: "अपनी सोलर बचत की गणना करें",
    subtitle: "देखें कि आप अपने घर या व्यवसाय के लिए रूफटॉप सोलर ऊर्जा से कितनी बचत कर सकते हैं।"
  },
  
  common: {
    monthlyRupees: "₹",
    years: "साल",
    details: "विवरण",
    monthlySavings: "मासिक बचत",
    warranty: "वारंटी"
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
    cta: "Book Free Site Visit Now"
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
    cta: "Explore Products",
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
        title: "Installation and Maintenance",
        description: "Professional installation and lifetime maintenance. Our skilled team installs your solar system and ensures its continuous care.",
        tags: ["Expert Installation", "Lifetime Support"]
      }
    }
  },
  
  products: {
    title: "Suggested Products",
    subtitle: "Tailored solutions for your solar energy needs",
    viewAll: "View All Products"
  },
  
  calculator: {
    title: "Calculate Your Solar Savings",
    subtitle: "See how much you can save with rooftop solar energy for your home or business."
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
