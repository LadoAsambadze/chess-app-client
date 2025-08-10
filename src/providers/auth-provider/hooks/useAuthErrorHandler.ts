import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { removeAccessToken } from '../../../utils/token.utils';
import { isAuthenticatedVar, userVar } from '../../../apollo/store';

export const useAuthErrorHandler = () => {
  const client = useApolloClient();

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
};
