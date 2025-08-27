import { QueryProvider } from './providers/query-provider/QueryProvider';
import { RouterProvider } from './providers/router-provider';

function App() {
  return (
    <QueryProvider>
      <RouterProvider />
    </QueryProvider>
  );
}

export default App;
