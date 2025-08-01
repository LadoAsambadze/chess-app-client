import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/app-routes';
import type { PropsWithChildren } from 'react';
import { AuthProvider } from '../auth-provider';

export const RouterProvider = ({ children }: PropsWithChildren<{}>) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};
