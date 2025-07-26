import type { PropsWithChildren } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../../enums/Routes/Routes';
import { HomePage } from '../../pages/HomePage/HomePage';
import { SignupPage } from '../../pages';
import { AuthSuccessPage } from '../../pages/AuthSuccesPage';
import { SigninPage } from '../../pages/SigninPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { ProtectedRoute } from '../AuthContext';

type RouterProviderProps = PropsWithChildren<object>;

export const RouterProvider = ({ children }: RouterProviderProps) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.SIGNIN} element={<SigninPage />} />
        <Route path={ROUTES.SUCCESS} element={<AuthSuccessPage />} />
        <Route element={<ProtectedRoute redirectTo={ROUTES.SIGNIN} />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        </Route>
      </Routes>
      {children}
    </BrowserRouter>
  );
};
