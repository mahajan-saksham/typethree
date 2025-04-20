import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Logo } from '../Logo';
import {
  BarChart4,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Layers,
  Package,
  UserCog,
  MessageSquare
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('Admin');
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is admin and get user name
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Get user profile to check role and get name
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, full_name')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data || !data.role) {
        setRole(null);
        navigate('/');
      } else {
        setRole(data.role);
        if (data.full_name) {
          setUserName(data.full_name);
        }
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getActiveClass = (path: string) => {
    return location.pathname === path
      ? 'bg-primary text-dark font-medium'
      : 'text-light/70 hover:text-light hover:bg-dark-200';
  };

  // Show loading until admin status is checked
  if (role === null) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  // Show access denied if not admin, sales, ops, or viewer
  if (!["admin", "sales", "ops", "viewer"].includes(role)) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-light p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You need admin, sales, ops, or viewer privileges to access this area.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-black rounded-lg"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      <div className="block md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-dark-200 text-light"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`w-64 bg-dark-100 border-r border-dark-200 md:flex flex-col ${isSidebarOpen ? 'fixed inset-0 z-40 flex' : 'hidden'} md:static`}
      >
        <div className="p-4 border-b border-dark-200">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Logo />
            <p className="text-primary font-medium">Welcome, {userName}</p>
            <p className="text-light/60 text-sm">Admin Dashboard</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard Overview: All roles */}
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary ${getActiveClass('/admin')}`}
            onClick={() => setIsSidebarOpen(false)}
            tabIndex={0}
          >
            <BarChart4 className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          {/* Rooftop Solar Section: admin, sales */}
          {(role === 'admin' || role === 'sales') && (
            <>
              <div className="mt-6 mb-2 text-xs text-light/40 uppercase tracking-widest font-semibold">Rooftop Solar</div>
              <Link to="/admin/rooftop-leads" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary ${getActiveClass('/admin/rooftop-leads')}`}> <ClipboardList className="h-5 w-5" /> <span>Leads</span></Link>
              <Link to="/admin/rooftop-installations" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary ${getActiveClass('/admin/rooftop-installations')}`}> <Layers className="h-5 w-5" /> <span>Installation Tracker</span></Link>
              <Link to="/admin/product-skus" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary ${getActiveClass('/admin/product-skus')}`}> <Package className="h-5 w-5" /> <span>Product SKUs</span></Link>
            </>
          )}

          {(role === 'admin' || role === 'ops') && (
            <>
              <div className="mt-6 mb-2 text-xs text-light/40 uppercase tracking-widest font-semibold">Support Tickets</div>
              <Link to="/admin/support-tickets" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary ${getActiveClass('/admin/support-tickets')}`}> <MessageSquare className="h-5 w-5" /> <span>Support Tickets</span></Link>
            </>
          )}

          {/* Users & Permissions: admin only */}
          {role === 'admin' && (
            <>
              <div className="mt-6 mb-2 text-xs text-light/40 uppercase tracking-widest font-semibold">Users & Permissions</div>
              <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary ${getActiveClass('/admin/users')}`}> <UserCog className="h-5 w-5" /> <span>Users Management</span></Link>
            </>
          )}

          {/* Reports: admin, viewer */}
          {(role === 'admin' || role === 'viewer') && (
            <>
              <div className="mt-6 mb-2 text-xs text-light/40 uppercase tracking-widest font-semibold">Reports</div>
              <Link to="/admin/reports" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary ${getActiveClass('/admin/reports')}`}> <BarChart4 className="h-5 w-5" /> <span>Reports</span></Link>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-dark-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-light/70 hover:text-light hover:bg-dark-200 rounded-lg transition"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <header className="bg-dark-100 p-6 border-b border-dark-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-2xl font-bold text-light">{title}</h1>
            <h2 className="text-xl font-semibold text-light mt-2 sm:mt-0">Welcome back, {userName}</h2>
          </div>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
