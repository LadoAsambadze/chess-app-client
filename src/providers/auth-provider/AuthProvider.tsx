import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import {
  accessTokenVar,
  isAuthenticatedVar,
  userVar,
} from '../../apollo/store';
import {
  SIGNIN_MUTATION,
  REFRESH_TOKEN_MUTATION,
} from '../../graphql/mutation';
import type {
  AuthContextType,
  AuthProviderProps,
  SigninInput,
  User,
} from './types';

// Create AuthContext with undefined initial value to ensure usage inside Provider only
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  console.log('AuthProvider mounting...');

  const client = useApolloClient();

  // Read global reactive vars from Apollo Client for centralized auth state
  const reactiveUser = useReactiveVar(userVar);
  const reactiveIsAuthenticated = useReactiveVar(isAuthenticatedVar);

  // Local React states for UI loading indicators
  const [user, setUser] = useState<User | null>(reactiveUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    reactiveIsAuthenticated
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log('AuthProvider initial state:', {
    user,
    isAuthenticated,
    isLoading,
    hasSession: sessionStorage.getItem('hasSession'),
  });

  // Helper to clear auth state
  const clearAuthState = () => {
    accessTokenVar('');
    userVar(null);
    isAuthenticatedVar(false);
    setUser(null);
    setIsAuthenticated(false);
    // Clear session flag
    sessionStorage.removeItem('hasSession');
  };

  // Refresh token using httpOnly cookie
  const refreshToken = useCallback(async () => {
    try {
      const { data } = await client.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
      });

      if (data?.refreshAccessToken?.accessToken) {
        const token = data.refreshAccessToken.accessToken;
        const userData = data.refreshAccessToken.user; // If your refresh returns user data

        accessTokenVar(token);
        if (userData) {
          userVar(userData);
          setUser(userData);
        }
        isAuthenticatedVar(true);
        setIsAuthenticated(true);

        return true;
      } else {
        clearAuthState();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearAuthState();
      return false;
    }
  }, [client]);

  // Initialize auth on app load by trying to refresh token (only if we had a previous session)
  useEffect(() => {
    const initializeAuth = async () => {
      // Only try to refresh if we had a previous session
      const hasSession = sessionStorage.getItem('hasSession');

      if (hasSession) {
        setIsLoading(true);
        const success = await refreshToken();
        if (!success) {
          // If refresh fails, clear the session flag
          sessionStorage.removeItem('hasSession');
        }
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Helper to update both reactive vars and local state together on signin
  const updateAuthState = (token: string, userData: User) => {
    console.log('Updating auth state with:', {
      token: token.substring(0, 20) + '...',
      userData,
    });

    // Store only in Apollo reactive variables (memory)
    accessTokenVar(token);
    userVar(userData);
    isAuthenticatedVar(true);

    setUser(userData);
    setIsAuthenticated(true);

    // Set a flag that we have had a successful login
    sessionStorage.setItem('hasSession', 'true');
    console.log('Set hasSession flag to true');
  };

  // Signin mutation and update auth state, with loading and error handling
  const signin = useCallback(
    async (input: SigninInput) => {
      setIsLoading(true);
      try {
        const { data } = await client.mutate({
          mutation: SIGNIN_MUTATION,
          variables: { signinInput: input },
        });

        if (data?.signin?.accessToken && data?.signin?.user) {
          updateAuthState(data.signin.accessToken, data.signin.user);
        } else {
          throw new Error('Missing user or token in signin response');
        }
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Provide auth state and actions through Context
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        signin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to consume auth context safely, throws if used outside provider
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
