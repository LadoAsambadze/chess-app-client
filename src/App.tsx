import client from './apollo/client';
import { Logout } from './auth/Logout';
import { AuthProvider, RouterProvider } from './providers';
import { ApolloProvider } from '@apollo/client';

function App() {
  return (
    <>
      <ApolloProvider client={client}>
        <AuthProvider>
          <Logout />
          <RouterProvider />
        </AuthProvider>
      </ApolloProvider>
    </>
  );
}

export default App;
