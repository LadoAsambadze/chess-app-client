import type { PropsWithChildren } from 'react';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import { ROUTES } from '../../enums/Routes/Routes';
import { HomePage } from '../../pages/HomePage/HomePage';
type RouterProviderProps = PropsWithChildren<object>;



export const RouterProvider = ({ children }: RouterProviderProps) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.Home} element={<HomePage />} />
      </Routes>
      {children}
    </BrowserRouter>
  );
};
