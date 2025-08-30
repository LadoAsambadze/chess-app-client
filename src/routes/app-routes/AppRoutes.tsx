import { Routes, Route } from 'react-router-dom';
import {
  // AuthSuccess,
  Dashboard,
  Games,
  Home,
  Signin,
  Signup,
} from '../../pages';
import { ProtectedRoute } from '../protected-route';
import { ROUTES } from '../../constants';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.SIGNUP} element={<Signup />} />
      <Route path={ROUTES.SIGNIN} element={<Signin />} />
      {/* <Route path={ROUTES.SUCCESS} element={<AuthSuccess />} /> */}
      <Route element={<ProtectedRoute redirectTo={ROUTES.SIGNIN} />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.GAMES} element={<Games />} />
      </Route>
    </Routes>
  );
};
