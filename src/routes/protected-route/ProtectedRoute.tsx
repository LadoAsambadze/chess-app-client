import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/auth-provider';
import { getAccessToken } from '../../utils/token.utils';

interface ProtectedRouteProps {
  redirectTo?: string;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectTo = '/signin',
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, isInitializing, user } = useAuth();
  const location = useLocation();

  // Show loading during initial auth check or general loading
  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <div className="text-gray-600">
            {isInitializing ? 'Checking authentication...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  // Check if we have a token but auth state hasn't been updated yet
  // This handles the edge case during page refresh
  const hasToken = getAccessToken();
  if (hasToken && !isAuthenticated && !isInitializing) {
    // We have a token but auth state isn't ready, show loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <div className="text-gray-600">Validating session...</div>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // For role-based access, we need user data
  // If we're authenticated but don't have user data yet, show loading
  if (requiredRole && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <div className="text-gray-600">Loading user data...</div>
        </div>
      </div>
    );
  }

  // Check role-based access if required
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Render the protected content
  return <Outlet />;
};
