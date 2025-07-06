import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu,
  X,
  Home,
  ShoppingBag,
  Info
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './Button';
import { Card } from './Card';
import { LanguageSwitcher } from './LanguageSwitcher';
// Site Visit form will be used in Contact page instead

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  // Add body class to prevent scrolling when menu is open and handle keyboard trap
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
      
      // Handle escape key to close menu
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMenuOpen(false);
      };
      
      window.addEventListener('keydown', handleEscKey);
      return () => {
        document.body.classList.remove('overflow-hidden');
        window.removeEventListener('keydown', handleEscKey);
      };
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className="fixed w-full z-50 transition-all duration-300 bg-gradient-to-br from-white/10 via-dark-900/60 to-dark-900/90 backdrop-blur-2xl shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - hover effects removed */}
          <Link to="/" className="block">
            <span className="inline-block">
              <Logo />
            </span>
          </Link>

          {/* Desktop Navigation - right aligned */}
          <div className="hidden md:flex md:items-center md:ml-auto gap-5">
            <div className="flex items-center gap-5">
  <Link 
    to="/" 
    className={`nav-link group flex flex-col items-center justify-center px-4 py-2 rounded-md transition-all duration-300 relative ${
      isActive('/') 
        ? 'text-primary bg-white/10 shadow-md' 
        : 'text-light/80 hover:text-primary hover:bg-white/5'
    }`}
  >
    <Home className="h-5 w-5 mb-0.5" />
    <span className="text-xs font-medium tracking-wide">Home</span>
  </Link>
  <Link 
    to="/products" 
    className={`nav-link group flex flex-col items-center justify-center px-4 py-2 rounded-md transition-all duration-300 relative ${
      isActive('/products') 
        ? 'text-primary bg-white/10 shadow-md' 
        : 'text-light/80 hover:text-primary hover:bg-white/5'
    }`}
  >
    <ShoppingBag className="h-5 w-5 mb-0.5" />
    <span className="text-xs font-medium tracking-wide">Products</span>
  </Link>
  <Link 
    to="/about" 
    className={`nav-link group flex flex-col items-center justify-center px-4 py-2 rounded-md transition-all duration-300 relative ${
      isActive('/about') 
        ? 'text-primary bg-white/10 shadow-md' 
        : 'text-light/80 hover:text-primary hover:bg-white/5'
    }`}
  >
    <Info className="h-5 w-5 mb-0.5" />
    <span className="text-xs font-medium tracking-wide">About</span>
  </Link>
</div>
            {/* Contact tab removed */}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Language Switcher in Mobile - next to menu button */}
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            
            <button
              className="md:hidden text-light p-2 transition-colors hover:text-primary focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-30 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed inset-x-0 top-20 z-40 transition-all duration-300 transform ${
          isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <Card 
          variant="glass" 
          className="mx-4 border border-white/20 shadow-lg max-h-[80vh] overflow-y-auto backdrop-blur-200 bg-gradient-to-br from-[#1a1d23] to-[#2f343a] rounded-3xl"
          id="mobile-menu"
        >
          <div className="p-4 space-y-4">
            <Link 
              to="/"
              className={`flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'text-primary bg-light/5' 
                  : 'text-light hover:text-primary hover:bg-light/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-sm font-medium">Home</span>
              <Home className="h-5 w-5" />
            </Link>
            <Link 
              to="/products"
              className={`flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/products') 
                  ? 'text-primary bg-light/5' 
                  : 'text-light hover:text-primary hover:bg-light/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-sm font-medium">Products</span>
              <ShoppingBag className="h-5 w-5" />
            </Link>
            <Link 
              to="/about"
              className={`flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/about') 
                  ? 'text-primary bg-light/5' 
                  : 'text-light hover:text-primary hover:bg-light/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-sm font-medium">About Us</span>
              <Info className="h-5 w-5" />
            </Link>
            {/* Contact tab removed from mobile menu */}

          </div>
        </Card>
      </div>

      {/* Site Visit Form has been moved to Contact page */}
    </nav>
  );
}