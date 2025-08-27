import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../providers/auth-provider';

interface ProtectedRouteProps {
  redirectTo?: string;
  requiredRole?: string;
}

export const ProtectedRoute = ({
  redirectTo = '/signin',
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
