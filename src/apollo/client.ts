import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');

  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        if (
          message.includes('Invalid refresh token') ||
          message.includes('refresh token not found')
        ) {
          console.log(`ℹ️ Expected auth state: ${message}`);
          return;
        }

        console.error(`GraphQL error: ${message}`);

        if (extensions?.code === 'UNAUTHENTICATED') {
          console.log('🔄 Authentication error - token may need refresh');
          // Don't automatically redirect - let the auth context handle it
        }
      });
    }

    if (networkError) {
      console.error(`Network error:`, networkError);

      if ('statusCode' in networkError && networkError.statusCode === 401) {
        console.log('🔄 401 Unauthorized - auth context will handle refresh');
      }
    }
  }
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      context: {
        credentials: 'include',
      },
    },
    query: {
      errorPolicy: 'all',
      context: {
        credentials: 'include',
      },
    },
    mutate: {
      errorPolicy: 'all',
      context: {
        credentials: 'include',
      },
    },
  },
});

export default apolloClient;
