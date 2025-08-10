import { createContext, useContext, useState, useEffect } from 'react';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { isAuthenticatedVar, userVar } from '../../apollo/store';
import {
  SIGNIN_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  GET_CURRENT_USER,
} from '../../graphql/mutation';

import type {
  AuthContextType,
  AuthProviderProps,
  SigninInput,
  User,
} from './types';
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '../../utils/token.utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const client = useApolloClient();

  const user = useReactiveVar(userVar);
  const isAuthenticated = useReactiveVar(isAuthenticatedVar);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const { data } = await client.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        errorPolicy: 'all',
        fetchPolicy: 'no-cache',
      });

      if (data?.refreshToken?.accessToken) {
        setAccessToken(data.refreshToken.accessToken);

        if (data.refreshToken.user) {
          userVar(data.refreshToken.user);
          isAuthenticatedVar(true);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    }
  };

  const validateAccessToken = async (): Promise<boolean> => {
    try {
      const { data } = await client.query({
        query: GET_CURRENT_USER,
        errorPolicy: 'all',
        fetchPolicy: 'network-only',
      });

      if (data?.me) {
        userVar(data.me);
        isAuthenticatedVar(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Access token validation failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = getAccessToken();

        if (accessToken) {
          // Access token exists, validate it
          const isValid = await validateAccessToken();

          if (!isValid) {
            // Access token is invalid, try to refresh
            console.log('Access token invalid, attempting refresh...');
            const refreshed = await refreshAccessToken();

            if (!refreshed) {
              // Refresh failed, clear auth state
              removeAccessToken();
              userVar(null);
              isAuthenticatedVar(false);
            }
          }
        } else {
          // No access token - do NOT call refreshAccessToken
          userVar(null);
          isAuthenticatedVar(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        removeAccessToken();
        userVar(null);
        isAuthenticatedVar(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [client]);

  // Listen for auth errors from Apollo error link
  useEffect(() => {
    const handleAuthError = async () => {
      console.log('Auth error detected, clearing auth state...');
      removeAccessToken();
      userVar(null);
      isAuthenticatedVar(false);
      await client.clearStore();
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [client]);

  const signin = async (input: SigninInput) => {
    setIsLoading(true);

    try {
      const { data, errors } = await client.mutate({
        mutation: SIGNIN_MUTATION,
        variables: { signinInput: input },
        errorPolicy: 'all',
        fetchPolicy: 'no-cache',
      });

      if (errors && errors.length > 0) {
        console.error('❌ GraphQL errors:', errors);
        const errorMessage = errors.map((err) => err.message).join(', ');
        throw new Error(`GraphQL Error: ${errorMessage}`);
      }

      if (!data?.signin?.user || !data?.signin?.accessToken) {
        throw new Error('Invalid signin response');
      }

      // Update auth state after successful signin
      setAccessToken(data.signin.accessToken);
      userVar(data.signin.user);
      isAuthenticatedVar(true);
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
      await client.mutate({
        mutation: LOGOUT_MUTATION,
        errorPolicy: 'all',
      });
    } catch (error) {
      console.error('❌ Logout mutation error:', error);
    } finally {
      removeAccessToken();
      userVar(null);
      isAuthenticatedVar(false);
      await client.clearStore();
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
