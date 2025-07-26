import { ApolloProvider } from '@apollo/client';
import { RouterProvider } from './containers';
import client from './apollo/client';
import { AuthProvider } from './containers/AuthContext/AuthContext';

function App() {
  return (
    <>
      <ApolloProvider client={client}>
        <AuthProvider>
          <RouterProvider />
        </AuthProvider>
      </ApolloProvider>
    </>
  );
}

export default App;
