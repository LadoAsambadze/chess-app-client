import { useApolloClient } from '@apollo/client';
import { useRef } from 'react';
import {
  GET_CURRENT_USER,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  SIGNIN_MUTATION,
} from '../../../graphql/mutation';
import { removeAccessToken, setAccessToken } from '../../../utils/token.utils';
import { isAuthenticatedVar, userVar } from '../../../apollo/store';
import type { SigninInput } from '../types/SigninInput';

export const useAuthMutations = () => {
  const client = useApolloClient();

  // Prevent multiple concurrent refresh attempts
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);
  const validatePromiseRef = useRef<Promise<boolean> | null>(null);

  const refreshAccessToken = async (): Promise<boolean> => {
    // Return existing promise if refresh is already in progress
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const { data } = await client.mutate({
          mutation: REFRESH_TOKEN_MUTATION,
          errorPolicy: 'all',
          fetchPolicy: 'no-cache',
        });

        if (data?.refreshToken?.accessToken) {
          setAccessToken(data.refreshToken.accessToken);

          if (data.refreshToken.user) {
            userVar(data.refreshToken.user);
            isAuthenticatedVar(true);
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        return false;
      } finally {
        // Clear the promise reference when done
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  };

  const validateAccessToken = async (): Promise<boolean> => {
    // Return existing promise if validation is already in progress
    if (validatePromiseRef.current) {
      return validatePromiseRef.current;
    }

    validatePromiseRef.current = (async () => {
      try {
        const { data, error } = await client.query({
          query: GET_CURRENT_USER,
          errorPolicy: 'all',
          fetchPolicy: 'network-only', // Force fresh validation
          notifyOnNetworkStatusChange: false, // Prevent extra loading states
        });

        if (data?.me && !error) {
          userVar(data.me);
          isAuthenticatedVar(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Access token validation failed:', error);
        return false;
      } finally {
        // Clear the promise reference when done
        validatePromiseRef.current = null;
      }
    })();

    return validatePromiseRef.current;
  };

  const signin = async (input: SigninInput) => {
    const { data, errors } = await client.mutate({
      mutation: SIGNIN_MUTATION,
      variables: { signinInput: input },
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    });

    if (errors && errors.length > 0) {
      console.error('❌ GraphQL errors:', errors);
      const errorMessage = errors.map((err) => err.message).join(', ');
      throw new Error(`GraphQL Error: ${errorMessage}`);
    }

    if (!data?.signin?.user || !data?.signin?.accessToken) {
      throw new Error('Invalid signin response');
    }

    // Update auth state after successful signin
    setAccessToken(data.signin.accessToken);
    userVar(data.signin.user);
    isAuthenticatedVar(true);
  };

  const logout = async () => {
    try {
      await client.mutate({
        mutation: LOGOUT_MUTATION,
        errorPolicy: 'all',
      });
    } catch (error) {
      console.error('❌ Logout mutation error:', error);
    } finally {
      removeAccessToken();
      userVar(null);
      isAuthenticatedVar(false);
      await client.clearStore();
    }
  };

  return {
    refreshAccessToken,
    validateAccessToken,
    signin,
    logout,
  };
};
