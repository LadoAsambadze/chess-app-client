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

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`GraphQL error: ${message}`);

      if (extensions?.code === 'UNAUTHENTICATED') {
        window.dispatchEvent(new CustomEvent('auth-error'));
      }
    });
  }
  if (networkError) {
    console.error('Network error:', networkError);

    if ('statusCode' in networkError && networkError.statusCode === 401) {
      window.dispatchEvent(new CustomEvent('auth-error'));
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  credentials: 'include',
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
});

export default apolloClient;
