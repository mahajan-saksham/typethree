// src/components/TaskMasterProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTaskMasterAuth } from '../contexts/TaskMasterAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Protected route for Task Master components
 * Redirects to login if user is not authenticated or doesn't have required role
 */
const TaskMasterProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, permissions, isLoading } = useTaskMasterAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for required role
  if (requiredRole && requiredRole === 'admin') {
    // Check if user has admin permissions
    if (!permissions?.isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-error mb-4">Access Denied</h1>
          <p className="text-light/60 mb-6">You do not have permission to access this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-dark rounded-lg"
          >
            Go Back
          </button>
        </div>
      );
    }
  }

  // User is authenticated and has required role, render the children
  return <>{children}</>;
};

export default TaskMasterProtectedRoute;
