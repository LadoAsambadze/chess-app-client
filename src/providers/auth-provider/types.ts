import type { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatar?: string;
  role: string;
}

export interface SigninInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (input: SigninInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
