import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { 
  LineChart,
  Zap,
  Receipt,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

// Define all possible navigation items
const allNavItems: NavItem[] = [
  // Overview removed
  { label: 'My Investments', icon: <LineChart className="h-5 w-5" />, href: 'investments' },
  { label: 'Wattage Credits', icon: <Zap className="h-5 w-5" />, href: 'credits' },
  { label: 'Purchase History', icon: <Receipt className="h-5 w-5" />, href: 'history' },
  { label: 'Support & Inquiries', icon: <MessageSquare className="h-5 w-5" />, href: 'support' },
  { label: 'Profile Settings', icon: <User className="h-5 w-5" />, href: 'profile' }
];

// Filter out the items we want to hide
const navItems: NavItem[] = allNavItems.filter(item => 
  item.label !== 'My Investments' && item.label !== 'Wattage Credits'
);

const DashboardLayout: React.FC = () => {
  console.log('DashboardLayout is rendering');
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const getProfile = async () => {
      try {
        console.log('Checking authentication status...');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user found, redirecting to auth page');
          navigate('/auth');
          return;
        }
        console.log('Authenticated user found:', user.email);
        
        // Get user profile from Supabase
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('user_id', user.id)
          .single();
        
        if (profiles?.full_name) {
          // Use full name if available - ensure first letter is capitalized
          const formattedName = profiles.full_name.charAt(0).toUpperCase() + profiles.full_name.slice(1);
          setUserName(formattedName);
        } else if (user.email) {
          // Fall back to email username if no full name - ensure first letter is capitalized
          const emailUsername = user.email.split('@')[0];
          const formattedUsername = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
          setUserName(formattedUsername);
        } else {
          // Last resort
          setUserName('User');
        }
        
        console.log('User profile fetched:', profiles, 'Current userName:', userName);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    getProfile();
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Function to check if a nav item is active
  const isActive = (href: string) => {
    // Get the current path without the leading slash
    const currentPath = location.pathname.split('/').pop() || '';
    // For the root dashboard path, 'profile' should be active (overview removed)
    if (currentPath === 'dashboard') return href === 'profile';
    // For other paths, check if the href matches the current path
    return href === currentPath;
  };

  // Debug logging for navigation
  console.log('Current location:', location.pathname);
  console.log('Current path segment:', location.pathname.split('/').pop());

  return (
    <div className="min-h-screen bg-dark text-light flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-10 w-64 bg-dark-100 border-r border-white/10 transform transition-transform duration-200 ease-in-out ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >  
        <div className="flex flex-col h-full">
          {/* Logo & Close Button */}
          <div className="flex flex-col items-center justify-center p-4 border-b border-white/10">
            <Link to="/" className="flex items-center justify-center mb-2">
              <Logo />
            </Link>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden absolute right-4 top-4 text-light/60 hover:text-light"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(item.href) 
                      ? 'bg-primary text-dark font-medium' 
                      : 'text-light/70 hover:text-light hover:bg-white/5'}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-6 mt-6 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-light/70 hover:text-light hover:bg-white/5 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-center w-full p-2 bg-dark-200 hover:bg-dark-300 text-light/70 hover:text-light rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-5 w-5 mr-2" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 mr-2" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-dark-100 border-b border-white/10 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden text-light/60 hover:text-light"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-light">Welcome back, {userName || 'User'}</h1>
              <p className="text-light/60 text-sm">Manage your rooftop solar system</p>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Use React Router's Outlet for nested routes */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;