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

  const hasToken = getAccessToken();
  if (hasToken && !isAuthenticated && !isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <div className="text-gray-600">Validating session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

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

  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
