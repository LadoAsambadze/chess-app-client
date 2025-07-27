// services/auth.service.ts
import { useMutation } from '@apollo/client';

import {
  tokenStorage,
  getUserFromToken,
  isAuthError,
  isTokenExpired,
} from '../utils/auth.utils';
import {
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  SIGNIN_MUTATION,
  SIGNUP_MUTATION,
} from '../../graphql/mutation';
import type { SigninInput, User } from '../types/auth.types';

/**
 * Custom hook for authentication operations
 * This handles all the GraphQL mutations and token management
 */
export const useAuthService = () => {
  // Configure mutations with proper credentials
  const [signinMutation] = useMutation(SIGNIN_MUTATION, {
    context: { credentials: 'include' },
    errorPolicy: 'all',
  });

  const [signupMutation] = useMutation(SIGNUP_MUTATION, {
    context: { credentials: 'include' },
    errorPolicy: 'all',
  });

  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION, {
    context: { credentials: 'include' },
    errorPolicy: 'all',
  });

  const [logoutMutation] = useMutation(LOGOUT_MUTATION, {
    context: { credentials: 'include' },
    errorPolicy: 'all',
  });

  /**
   * Sign in user with email and password
   */
  const signin = async (
    input: SigninInput
  ): Promise<{ user: User; accessToken: string }> => {
    try {
      console.log('🔐 Attempting signin...');

      const { data, errors } = await signinMutation({
        variables: { signinInput: input },
      });

      if (errors && errors.length > 0) {
        console.error('❌ Signin errors:', errors);
        throw new Error(errors[0].message || 'Signin failed');
      }

      if (!data?.signin?.user || !data?.signin?.accessToken) {
        throw new Error('Invalid response from server');
      }

      const { user, accessToken } = data.signin;

      // Store token
      tokenStorage.setAccessToken(accessToken);

      console.log('✅ Signin successful');
      return { user, accessToken };
    } catch (error) {
      console.error('❌ Signin failed:', error);
      throw error;
    }
  };

  /**
   * Sign up new user
   */
  const signup = async (
    input: any
  ): Promise<{ user: User; accessToken: string }> => {
    try {
      console.log('📝 Attempting signup...');

      const { data, errors } = await signupMutation({
        variables: { signupInput: input },
      });

      if (errors && errors.length > 0) {
        console.error('❌ Signup errors:', errors);
        throw new Error(errors[0].message || 'Signup failed');
      }

      if (!data?.signup?.user || !data?.signup?.accessToken) {
        throw new Error('Invalid response from server');
      }

      const { user, accessToken } = data.signup;

      // Store token
      tokenStorage.setAccessToken(accessToken);

      console.log('✅ Signup successful');
      return { user, accessToken };
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  };

  /**
   * Refresh access token using HTTP-only refresh token cookie
   */
  const refreshToken = async (): Promise<{
    success: boolean;
    accessToken?: string;
  }> => {
    try {
      console.log('🔄 Attempting token refresh...');

      const { data, errors } = await refreshTokenMutation();

      if (errors && errors.length > 0) {
        console.error('❌ Refresh token errors:', errors);

        // Check if it's an authentication error
        if (isAuthError(errors)) {
          console.log('🚫 Refresh token is invalid or expired');
          tokenStorage.removeAccessToken();
          return { success: false };
        }

        throw new Error(errors[0].message || 'Token refresh failed');
      }

      const newToken = data?.refreshTokens?.accessToken;
      if (!newToken) {
        console.log('❌ No access token in refresh response');
        tokenStorage.removeAccessToken();
        return { success: false };
      }

      console.log('✅ Token refresh successful');
      tokenStorage.setAccessToken(newToken);
      return { success: true, accessToken: newToken };
    } catch (error) {
      console.error('❌ Token refresh failed with exception:', error);
      tokenStorage.removeAccessToken();
      return { success: false };
    }
  };

  /**
   * Logout user and clear all tokens
   */
  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Starting logout...');

      await logoutMutation();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Continue with cleanup even if server logout fails
    } finally {
      // Always clear local storage
      tokenStorage.removeAccessToken();
    }
  };

  /**
   * Check if current stored token is valid
   */
  const hasValidToken = (): boolean => {
    return tokenStorage.hasValidStoredToken();
  };

  /**
   * Get user from stored token
   */
  const getUserFromStoredToken = (): User | null => {
    const token = tokenStorage.getAccessToken();
    return token ? getUserFromToken(token) : null;
  };

  /**
   * Initialize authentication state
   * Checks stored token and attempts refresh if needed
   */
  const initializeAuth = async (): Promise<{
    user: User | null;
    accessToken: string | null;
  }> => {
    console.log('🚀 Initializing auth...');

    const storedToken = tokenStorage.getAccessToken();

    // Check if we have a valid stored token
    if (storedToken && !isTokenExpired(storedToken)) {
      console.log('✅ Using valid stored token');
      const user = getUserFromToken(storedToken);
      return { user, accessToken: storedToken };
    }

    // Try to refresh token (HttpOnly cookie will be sent automatically)
    console.log('🔄 Attempting initial token refresh...');
    const refreshResult = await refreshToken();

    if (refreshResult.success && refreshResult.accessToken) {
      const user = getUserFromToken(refreshResult.accessToken);
      return { user, accessToken: refreshResult.accessToken };
    }

    console.log('❌ No valid session found');
    return { user: null, accessToken: null };
  };

  return {
    signin,
    signup,
    refreshToken,
    logout,
    hasValidToken,
    getUserFromStoredToken,
    initializeAuth,
  };
};
