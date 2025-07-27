import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useMutation, gql } from '@apollo/client';

// Your existing GraphQL mutations
const SIGNIN_MUTATION = gql`
  mutation Signin($signinInput: SigninRequest!) {
    signin(signinInput: $signinInput) {
      user {
        id
        email
        firstname
        lastname
        avatar
        role
      }
      accessToken
    }
  }
`;

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshTokens {
      accessToken
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signin: (input: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility functions
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

const isTokenExpired = (token: string, bufferSeconds = 30): boolean => {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + bufferSeconds;
  } catch {
    return true;
  }
};

// 🔍 Debug function to check cookies
const debugCookies = () => {
  console.log('🍪 All cookies:', document.cookie);
  console.log('🌐 Current domain:', window.location.hostname);
  console.log('🔒 Current protocol:', window.location.protocol);
  console.log('🚪 Current port:', window.location.port);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure mutations with proper credentials
  const [signinMutation] = useMutation(SIGNIN_MUTATION, {
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

  // Enhanced refresh token function with better debugging
  const refreshToken = async (): Promise<boolean> => {
    console.log('🔄 Attempting token refresh...');

    // Debug cookie information
    debugCookies();

    try {
      // Make the refresh request
      const { data, errors } = await refreshTokenMutation();

      if (errors && errors.length > 0) {
        console.error('❌ Refresh token errors:', errors);

        // Log detailed error information
        errors.forEach((error) => {
          console.error('Error message:', error.message);
          console.error('Error extensions:', error.extensions);
          console.error('Error path:', error.path);
        });

        // Check for authentication errors
        const hasAuthError = errors.some(
          (error) =>
            error.message.includes('refresh token') ||
            error.message.includes('not found') ||
            error.message.includes('expired') ||
            error.message.includes('invalid') ||
            error.extensions?.code === 'UNAUTHENTICATED'
        );

        if (hasAuthError) {
          console.log('🚫 Refresh token is invalid or expired');
          // Clear auth state
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem('accessToken');
          return false;
        }
      }

      const newToken = data?.refreshTokens?.accessToken;
      if (newToken) {
        console.log('✅ Token refresh successful');
        setAccessToken(newToken);
        updateUserFromToken(newToken);
        localStorage.setItem('accessToken', newToken);
        return true;
      }

      console.log('❌ No new token received in response');
      console.log('Response data:', data);
      return false;
    } catch (error) {
      console.error('❌ Token refresh failed with exception:', error);

      // Log network error details
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
      }

      // Clear auth state on error
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      return false;
    }
  };

  const updateUserFromToken = (token: string) => {
    const payload = decodeJWT(token);
    if (payload) {
      const userData = {
        id: payload.sub,
        email: payload.email,
        firstname: payload.firstname || '',
        lastname: payload.lastname || '',
        avatar: payload.avatar,
        role: payload.role,
      };
      setUser(userData);
    }
  };

  const signin = async (input: any) => {
    console.log('🔐 Starting signin...');
    try {
      setIsLoading(true);
      setError(null);

      const { data, errors } = await signinMutation({
        variables: { signinInput: input },
      });

      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message;
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (data?.signin) {
        console.log('✅ Signin successful');
        setUser(data.signin.user);
        setAccessToken(data.signin.accessToken);
        localStorage.setItem('accessToken', data.signin.accessToken);

        // Debug cookies after signin
        setTimeout(debugCookies, 100);
      }
    } catch (err: any) {
      console.error('❌ Signin failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Starting logout...');
    try {
      await logoutMutation();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setError(null);
      localStorage.removeItem('accessToken');
      setIsLoading(false);
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');

      // Debug initial state
      debugCookies();

      const storedToken = localStorage.getItem('accessToken');

      if (storedToken && !isTokenExpired(storedToken)) {
        console.log('✅ Using valid stored token');
        setAccessToken(storedToken);
        updateUserFromToken(storedToken);
        setIsLoading(false);
        return;
      }

      // Try to refresh token (HttpOnly cookie will be sent automatically)
      console.log('🔄 Attempting initial token refresh...');
      const success = await refreshToken();

      if (!success) {
        console.log('❌ No valid session found');
      }

      setIsLoading(false);
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

    const interval = setInterval(checkTokenExpiry, 2 * 60 * 1000); // Check every 2 minutes
    return () => clearInterval(interval);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: Boolean(
          user && accessToken && !isTokenExpired(accessToken, 0)
        ),
        isLoading,
        error,
        signin,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
