import type { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  // Add other user properties as needed
}

export interface SigninInput {
  email: string;
  password: string;
}

export interface SigninResponse {
  user: User;
  accessToken: string;
  // refreshToken is handled via HTTP-only cookies
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  signin: (input: SigninInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
