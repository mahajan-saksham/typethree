import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Import admin pages
const AdminDashboard = React.lazy(() => import('./admin/Dashboard'));
const UsersManagement = React.lazy(() => import('./admin/UsersManagement'));
const InvestmentsManagement = React.lazy(() => import('./admin/InvestmentsManagement'));
const WattageCreditsAdmin = React.lazy(() => import('./admin/WattageCreditsAdmin'));

// Placeholder components for future implementation
const ProjectsManagement = React.lazy(() => import('./admin/ProjectsManagement'));
const TransactionsManagement = React.lazy(() => import('./admin/TransactionsManagement'));
const KycReview = React.lazy(() => import('./admin/KycReview'));
const SupportTickets = React.lazy(() => import('./admin/SupportTickets'));
const SystemConfig = React.lazy(() => import('./admin/SystemConfig'));

// Import rooftop solar pages
const RooftopLeads = React.lazy(() => import('./admin/RooftopLeads'));
const RooftopInstallations = React.lazy(() => import('./admin/RooftopInstallations'));
const ProductSKUs = React.lazy(() => import('./admin/ProductSKUs'));

// Base Admin component serving as the entry point for auth checks
const Admin = React.lazy(() => import('./Admin'));

const AdminRoutes: React.FC = () => {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Check if the user is an admin
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        try {
          // Try using the database function approach first
          const { data, error } = await supabase.rpc('is_admin', {
            user_id: user.id
          });
          
          if (error) throw error;
          setIsAdmin(data || false);
          console.log('Admin check via RPC function:', data);
        } catch (err) {
          console.log('Falling back to direct query approach');
          // Fallback to direct query with simplified RLS
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching profile:', error);
            setIsAdmin(false);
          } else {
            console.log('User profile from direct query:', profile);
            setIsAdmin(profile?.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Show loading indicator while checking admin status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect non-admin users
  if (isAdmin === false) {
    return <Navigate to="/auth?required=admin" />;
  }

  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="investments" element={<InvestmentsManagement />} />
      <Route path="wattage-credits" element={<WattageCreditsAdmin />} />
      <Route path="projects" element={<ProjectsManagement />} />
      <Route path="transactions" element={<TransactionsManagement />} />
      <Route path="kyc" element={<KycReview />} />
      <Route path="support-tickets" element={<SupportTickets />} />
      <Route path="config" element={<SystemConfig />} />
      
      {/* Rooftop Solar Routes */}
      <Route path="rooftop-leads" element={<RooftopLeads />} />
      <Route path="rooftop-installations" element={<RooftopInstallations />} />
      <Route path="product-skus" element={<ProductSKUs />} />
      
      <Route path="legacy" element={<Admin />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
};

export default AdminRoutes;
