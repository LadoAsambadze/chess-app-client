// types/auth.types.ts
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

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signin: (input: SigninInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}
