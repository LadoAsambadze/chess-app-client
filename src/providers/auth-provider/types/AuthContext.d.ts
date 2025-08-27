// types/AuthContext.ts
export interface AuthContextType {
  user: any; // Replace with your user type
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  initializeAuth: () => Promise<void>;
  signin: (input: SigninInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}
