/**
 * Test component for the enhanced admin validation functionality
 * This component demonstrates the use of the useAdminGuard hook
 */

import React from 'react';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { Shield, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const AdminGuardTest: React.FC = () => {
  const { isAdmin, isLoading, error, checkCurrentUserAdminStatus } = useAdminGuard();

  const handleRefresh = () => {
    checkCurrentUserAdminStatus();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-dark-100 rounded-lg shadow-md text-light">
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-medium">Admin Access Validator</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-dark-200 p-4 rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-2 text-light/70">Validating admin permissions...</span>
            </div>
          ) : error ? (
            <div className="flex items-start bg-error/10 border border-error/20 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
              <div className="ml-2">
                <h3 className="font-medium text-error">Validation Error</h3>
                <p className="text-sm text-light/70">{error}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              {isAdmin ? (
                <>
                  <div className="bg-primary/20 p-3 rounded-full mb-3">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-primary mb-1">Admin Access Verified</h3>
                  <p className="text-sm text-light/70 text-center">
                    You have administrative permissions and can access protected areas.
                  </p>
                </>
              ) : (
                <>
                  <div className="bg-error/20 p-3 rounded-full mb-3">
                    <AlertCircle className="h-8 w-8 text-error" />
                  </div>
                  <h3 className="text-lg font-medium text-error mb-1">Access Denied</h3>
                  <p className="text-sm text-light/70 text-center">
                    You do not have administrative permissions required to access protected areas.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleRefresh}
            className="bg-primary text-dark hover:bg-primary-hover px-4 py-2 rounded-lg transition-colors font-medium flex items-center"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Revalidate Permissions
          </button>
        </div>

        <div className="mt-4 bg-dark-200/50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Security Information</h4>
          <p className="text-xs text-light/60">
            This component uses an enhanced secure validation process with rate limiting and
            proper error handling. All validation attempts are logged for security monitoring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminGuardTest;
