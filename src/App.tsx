import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo/client';
import { RouterProvider } from './providers';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <RouterProvider />
    </ApolloProvider>
  );
}

export default App;
