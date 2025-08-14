import { useState, useEffect, useRef } from 'react';

import { useAuthMutations } from './useAuthMutations';
import { getAccessToken, removeAccessToken } from '../../../utils/token.utils';
import { isAuthenticatedVar, userVar } from '../../../apollo/store';

export const useAuthInitialization = () => {
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const { validateAccessToken, refreshAccessToken } = useAuthMutations();
  const initializationRef = useRef(false); // Prevent multiple initializations

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        const accessToken = getAccessToken();

        if (accessToken) {
          // First try to validate existing token
          const isValid = await validateAccessToken();


        

          if (!isValid) {
            console.log('Access token invalid, attempting refresh...');
            const refreshed = await refreshAccessToken();

            if (!refreshed) {
              console.log('Refresh failed, clearing auth state');
              removeAccessToken();
              userVar(null);
              isAuthenticatedVar(false);
            }
          }
        } else {
          // No access token, set unauthenticated state
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
  }, []); // Remove dependencies to prevent re-runs

  return isInitializing;
};
