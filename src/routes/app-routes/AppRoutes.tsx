import { Routes, Route } from 'react-router-dom';
import {
  AuthSuccess,
  Games,
  Home,
  Signin,
  Signup,
  UpdatePassword,
  UserGame,
} from '../../pages';
import { ProtectedRoute } from '../protected-route';
import { ROUTES } from '../../constants';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.SIGNUP} element={<Signup />} />
      <Route path={ROUTES.SIGNIN} element={<Signin />} />
      <Route path={ROUTES.SUCCESS} element={<AuthSuccess />} />
      <Route path={ROUTES.UPDATE_PASSWORD} element={<UpdatePassword />} />
      <Route element={<ProtectedRoute redirectTo={ROUTES.SIGNIN} />}>
        <Route path={ROUTES.GAMES} element={<Games />} />
        <Route path={ROUTES.USER_GAME} element={<UserGame />} />
      </Route>
    </Routes>
  );
};
