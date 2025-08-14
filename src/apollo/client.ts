import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { getAccessToken } from '../utils/token.utils';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const accessToken = getAccessToken();

  return {
    headers: {
      ...headers,
      ...(accessToken && { authorization: `Bearer ${accessToken}` }),
    },
  };
});

// Enhanced error link with deduplication
let lastAuthErrorTime = 0;
const AUTH_ERROR_DEBOUNCE = 1000; // 1 second debounce

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    const now = Date.now();

    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        console.error(`GraphQL error: ${message}`);

        if (extensions?.code === 'UNAUTHENTICATED') {
          // Debounce auth errors to prevent multiple rapid events
          if (now - lastAuthErrorTime > AUTH_ERROR_DEBOUNCE) {
            lastAuthErrorTime = now;
            window.dispatchEvent(new CustomEvent('auth-error'));
          }
        }
      });
    }

    if (networkError) {
      console.error('Network error:', networkError);

      if ('statusCode' in networkError && networkError.statusCode === 401) {
        // Debounce network auth errors too
        if (now - lastAuthErrorTime > AUTH_ERROR_DEBOUNCE) {
          lastAuthErrorTime = now;
          window.dispatchEvent(new CustomEvent('auth-error'));
        }
      }
    }
  }
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Cache current user data to reduce requests
          me: {
            merge: true,
          },
        },
      },
      User: {
        fields: {
          // Merge user updates instead of replacing
          // This helps with consistent user state
          id: {
            merge: false,
          },
        },
      },
    },
  }),
  credentials: 'include',
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      // Add some caching for frequently accessed queries
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      // Use cache first for better performance
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
      // Always use network for mutations
      fetchPolicy: 'no-cache',
    },
  },
});

export default apolloClient;
