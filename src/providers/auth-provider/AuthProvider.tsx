import { createContext, useContext, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { isAuthenticatedVar, userVar } from '../../apollo/store';
import { useAuthMutations } from './hooks/useAuthMutations';
import { useAuthInitialization } from './hooks/useAuthInitialization';
import { useAuthErrorHandler } from './hooks/useAuthErrorHandler';
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
  } = useAuthMutations();
  useAuthErrorHandler();

  const signin = async (input: SigninInput) => {
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

  const logout = async () => {
    setIsLoading(true);
    try {
      await performLogout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isInitializing,
        signin,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
