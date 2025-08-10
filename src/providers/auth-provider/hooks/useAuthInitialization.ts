import { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
 
import { useAuthMutations } from './useAuthMutations';
import { getAccessToken, removeAccessToken } from '../../../utils/token.utils';
import { isAuthenticatedVar, userVar } from '../../../apollo/store';

export const useAuthInitialization = () => {
  const client = useApolloClient();
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const { validateAccessToken, refreshAccessToken } = useAuthMutations();

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
  }, [client, validateAccessToken, refreshAccessToken]);

  return isInitializing;
};
