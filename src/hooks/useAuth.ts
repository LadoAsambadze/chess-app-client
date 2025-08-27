import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '../utils/token.utils';
import type { SigninInput } from '../providers/auth-provider/types/SigninInput';
import { authService } from '../services/auth.service';

export function useAuth() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: SigninInput) => authService.signin(input),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['currentUser'], data.user);
    },
    onError: (error) => {
      console.error('Sign in error:', error);
    },
  });

  return {
    ...mutation,
    isLoading:
      (mutation as any).isPending ?? (mutation as any).isLoading ?? false,
  };
}

export function useSignUp() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: any) => authService.signup(input),
    onSuccess: (data) => {
      if (data.accessToken && data.user) {
        setAccessToken(data.accessToken);
        queryClient.setQueryData(['currentUser'], data.user);
      }
    },
    onError: (error) => {
      console.error('Sign up error:', error);
    },
  });

  return {
    ...mutation,
    isLoading:
      (mutation as any).isPending ?? (mutation as any).isLoading ?? false,
  };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      removeAccessToken();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      removeAccessToken();
      queryClient.clear();
    },
  });

  return {
    ...mutation,
    isLoading:
      (mutation as any).isPending ?? (mutation as any).isLoading ?? false,
  };
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['currentUser'], data.user);
    },
    onError: (error) => {
      console.error('Refresh token error:', error);
      removeAccessToken();
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    },
  });

  return {
    ...mutation,
    isLoading:
      (mutation as any).isPending ?? (mutation as any).isLoading ?? false,
  };
}

export function useTokenExpiry() {
  const { mutate: refreshToken } = useRefreshToken();

  const checkAndRefreshToken = () => {
    const token = getAccessToken();
    if (token && isTokenExpired(token)) {
      refreshToken();
    }
  };

  return { checkAndRefreshToken };
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}
