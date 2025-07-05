import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { validateAdminRights } from '../utils/adminAuth';

// Import admin pages
const AdminDashboard = React.lazy(() => import('./admin/Dashboard'));
const UsersManagement = React.lazy(() => import('./admin/UsersManagement'));
const InvestmentsManagement = React.lazy(() => import('./admin/InvestmentsManagement'));
const WattageCreditsAdmin = React.lazy(() => import('./admin/WattageCreditsAdmin'));
const SecurityLogs = React.lazy(() => import('./admin/SecurityLogs'));
const CSPViolationReports = React.lazy(() => import('./admin/CSPViolationReports'));
const JWTKeyManagement = React.lazy(() => import('./admin/JWTKeyManagement'));

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
  // Use enhanced admin guard hook with improved security
  const { isAdmin, isLoading: loading, error, clearCache } = useAdminGuard();
  const navigate = useNavigate();
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [serverValidationError, setServerValidationError] = useState<string | null>(null);
  
  // Perform server-side validation as an additional security layer
  useEffect(() => {
    // Skip server validation if we already know they're not an admin
    if (isAdmin === false) {
      return;
    }
    
    // Only perform server validation once isAdmin is resolved from the hook
    if (isAdmin === true && !validationAttempted) {
      setValidationAttempted(true);
      
      // Validate admin rights against the secure server-side endpoint
      validateAdminRights()
        .then(isServerAdmin => {
          // If server validation disagrees with client validation, force refresh
          if (!isServerAdmin && isAdmin) {
            console.warn('Security mismatch detected: Client reports admin but server denies. Refreshing security context.');
            // Clear both caches and navigate to auth
            clearCache();
            navigate('/auth?required=admin&reason=security');
          }
        })
        .catch(err => {
          console.error('Server-side admin validation failed:', err);
          setServerValidationError('Server validation failed. Using cached permissions.');
          // Continue with client-side validation as fallback
        });
    }
  }, [isAdmin, validationAttempted, clearCache, navigate]);
  
  // Debug logging
  useEffect(() => {
    if (error) {
      console.error('Admin validation error:', error);
    }
    
    if (isAdmin !== null) {
      console.log('Admin status determined:', isAdmin);
    }
  }, [isAdmin, error]);

  // Show loading indicator while checking admin status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-200">Verifying admin access...</p>
      </div>
    );
  }

  // Redirect non-admin users with informative message
  if (isAdmin === false) {
    // Log unauthorized access attempt
    console.warn('Unauthorized admin access attempt redirected');
    return <Navigate to="/auth?required=admin" />;
  }

  // Display a warning banner if there was a server validation issue but client validation passed
  const AdminLayout = ({ children }: { children: React.ReactNode }) => (
    <>
      {serverValidationError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Admin Validation Warning</p>
          <p>{serverValidationError}</p>
        </div>
      )}
      {children}
    </>
  );
  
  return (
    <Routes>
      <Route index element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="users" element={<AdminLayout><UsersManagement /></AdminLayout>} />
      <Route path="investments" element={<AdminLayout><InvestmentsManagement /></AdminLayout>} />
      <Route path="wattage-credits" element={<AdminLayout><WattageCreditsAdmin /></AdminLayout>} />
      <Route path="projects" element={<AdminLayout><ProjectsManagement /></AdminLayout>} />
      <Route path="transactions" element={<AdminLayout><TransactionsManagement /></AdminLayout>} />
      <Route path="kyc" element={<AdminLayout><KycReview /></AdminLayout>} />
      <Route path="support-tickets" element={<AdminLayout><SupportTickets /></AdminLayout>} />
      <Route path="config" element={<AdminLayout><SystemConfig /></AdminLayout>} />
      <Route path="security-logs" element={<AdminLayout><SecurityLogs /></AdminLayout>} />
      
      {/* Rooftop Solar Routes */}
      <Route path="rooftop-leads" element={<AdminLayout><RooftopLeads /></AdminLayout>} />
      <Route path="rooftop-installations" element={<AdminLayout><RooftopInstallations /></AdminLayout>} />
      <Route path="product-skus" element={<AdminLayout><ProductSKUs /></AdminLayout>} />
      
      {/* Security Routes */}
      <Route path="csp-violation-reports" element={<AdminLayout><CSPViolationReports /></AdminLayout>} />
      <Route path="jwt-key-management" element={<AdminLayout><JWTKeyManagement /></AdminLayout>} />
      
      <Route path="legacy" element={<AdminLayout><Admin /></AdminLayout>} />
      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
};

export default AdminRoutes;
