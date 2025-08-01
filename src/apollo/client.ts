import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { accessTokenVar } from './store';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = accessTokenVar();
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`GraphQL error: ${message}`);

      if (extensions?.code === 'UNAUTHENTICATED') {
        accessTokenVar('');
        window.dispatchEvent(new CustomEvent('auth-error'));
      }
    });
  }

  if (networkError) {
    console.error('Network error:', networkError);

    if ('statusCode' in networkError && networkError.statusCode === 401) {
      accessTokenVar('');
      window.dispatchEvent(new CustomEvent('auth-error'));
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
});

export default apolloClient;
