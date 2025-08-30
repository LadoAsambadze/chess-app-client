import type React from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import type { User } from './types/User';
import type { SigninInput } from './types/SigninInput';
import { getAccessToken } from '../../utils/token.utils';
import {
  useCurrentUser,
  useLogout,
  useRefreshToken,
  useSignin as useSignInHook,
  useSignUp,
  useTokenExpiry,
} from '../../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (input: SigninInput) => void;
  signup: (input: any) => void;
  logout: () => void;
  refreshToken: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const signInMutation = useSignInHook();
  const signUpMutation = useSignUp();
  const logoutMutation = useLogout();
  const refreshTokenMutation = useRefreshToken();
  const { checkAndRefreshToken } = useTokenExpiry();

  const isAuthenticated = !!user && !!getAccessToken();

  const isLoading =
    isUserLoading ||
    signInMutation.isLoading ||
    signUpMutation.isLoading ||
    logoutMutation.isLoading ||
    refreshTokenMutation.isLoading;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAndRefreshToken();
      }
    }, 1 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkAndRefreshToken]);

  const contextValue = useMemo(
    () => ({
      user: user || null,
      isAuthenticated,
      isLoading,
      signin: signInMutation.mutate,
      signup: signUpMutation.mutate,
      logout: logoutMutation.mutate,
      refreshToken: refreshTokenMutation.mutate,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      signInMutation.mutate,
      signUpMutation.mutate,
      logoutMutation.mutate,
      refreshTokenMutation.mutate,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
