import type { PropsWithChildren } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../../constants/routes/Routes';
import { AuthSuccess, Dashboard, Home, Signin, Signup } from '../../pages';
import { ProtectedRoute } from '../../routes';

type RouterProviderProps = PropsWithChildren<object>;

export const RouterProvider = ({ children }: RouterProviderProps) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.SIGNIN} element={<Signin />} />
        <Route path={ROUTES.SUCCESS} element={<AuthSuccess />} />
        <Route element={<ProtectedRoute redirectTo={ROUTES.SIGNIN} />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        </Route>
      </Routes>
      {children}
    </BrowserRouter>
  );
};
