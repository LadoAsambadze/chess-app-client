// hooks/useAuthGuard.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const useAuthGuard = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook to redirect authenticated users away from auth pages
 * Useful for login/signup pages
 */
export const useGuestGuard = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook to check user roles/permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin') || hasRole('ADMIN');
  };

  const isModerator = (): boolean => {
    return hasRole('moderator') || hasRole('MODERATOR');
  };

  const isUser = (): boolean => {
    return hasRole('user') || hasRole('USER');
  };

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
    isUser,
    userRole: user?.role || null,
  };
};
