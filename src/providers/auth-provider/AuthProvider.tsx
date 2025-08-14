import { createContext, useContext, useState, useMemo } from 'react';
import { useReactiveVar } from '@apollo/client';
import { isAuthenticatedVar, userVar } from '../../apollo/store';
import { useAuthMutations } from './hooks/useAuthMutations';
import { useAuthInitialization } from './hooks/useAuthInitialization';
import { useAuthErrorHandler } from './hooks/useAuthErrorHandler';
import { setAccessToken, removeAccessToken } from '../../utils/token.utils'; // updated import
import type { AuthContextType } from './types/AuthContext';
import type { AuthProviderProps } from './types/AuthProviderProps';
import type { SigninInput } from './types/SigninInput';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {


  const user = useReactiveVar(userVar);
  const isAuthenticated = useReactiveVar(isAuthenticatedVar);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isInitializing = useAuthInitialization();
  
  const {
    signin: performSignin,
    logout: performLogout,
    refreshAccessToken,
    validateAccessToken,
  } = useAuthMutations();

  useAuthErrorHandler();

  const signin = async (input: SigninInput) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await performSignin(input);
    } catch (error) {
      console.error('❌ Signin error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = async (token: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log('🔑 Setting access token from Google OAuth...');

      // Store the access token first via token.utils
      setAccessToken(token);

      console.log('🔍 Validating token with GraphQL...');

      // Use the existing validateAccessToken method to get user data via GraphQL
      const isValid = await validateAccessToken();

      if (!isValid) {
        throw new Error('Invalid token received from Google OAuth');
      }

      console.log('✅ Google authentication successful');
    } catch (error) {
      console.error('❌ Google login error:', error);

      // Clean up on error through token utils
      removeAccessToken();
      userVar(null);
      isAuthenticatedVar(false);

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isLoading) return; // Prevent multiple concurrent logout attempts

    setIsLoading(true);
    try {
      await performLogout();
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      isInitializing,
      signin,
      loginWithToken,
      logout,
      refreshAccessToken,
    }),
    [user, isAuthenticated, isLoading, isInitializing, refreshAccessToken]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
