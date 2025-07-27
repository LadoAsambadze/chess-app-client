// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import { useAuthService } from '../services/auth.service';

import type { AuthContextType, SigninInput, User } from '../types/auth.types';
import { isTokenExpired } from '../utils/auth.utils';

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication service
  const authService = useAuthService();

  /**
   * Sign in user
   */
  const signin = async (input: SigninInput): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.signin(input);

      setUser(result.user);
      setAccessToken(result.accessToken);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Signin failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with cleanup even if server logout fails
    } finally {
      // Clear state
      setUser(null);
      setAccessToken(null);
      setError(null);
      setIsLoading(false);
    }
  };

  /**
   * Refresh access token
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      const result = await authService.refreshToken();

      if (result.success && result.accessToken) {
        setAccessToken(result.accessToken);

        // Update user from new token
        const updatedUser = authService.getUserFromStoredToken();
        setUser(updatedUser);

        return true;
      } else {
        // Clear state if refresh failed
        setUser(null);
        setAccessToken(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setUser(null);
      setAccessToken(null);
      return false;
    }
  };

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const result = await authService.initializeAuth();

        setUser(result.user);
        setAccessToken(result.accessToken);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!accessToken) return;

    const checkTokenExpiry = () => {
      if (isTokenExpired(accessToken)) {
        console.log('🔄 Token expiring, refreshing...');
        refreshToken();
      }
    };

    // Check every 2 minutes
    const interval = setInterval(checkTokenExpiry, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  // Calculate authentication status
  const isAuthenticated = Boolean(
    user && accessToken && !isTokenExpired(accessToken, 0)
  );

  const contextValue: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    signin,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
