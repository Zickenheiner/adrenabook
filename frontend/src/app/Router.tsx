import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Private from './Private';
import Public from './Public';
import routes from '@/core/constants/routes';
import SystemHealthPage from '@/features/system/presentation/pages/SystemHealthPage';
import RegisterPage from '@/features/auth/presentation/pages/RegisterPage';
import LoginPage from '@/features/auth/presentation/pages/LoginPage';
import PasswordResetRequestPage from '@/features/auth/presentation/pages/PasswordResetRequestPage';
import PasswordResetConfirmPage from '@/features/auth/presentation/pages/PasswordResetConfirmPage';

export default function Router() {
  const PublicRoutes = () => {
    return (
      <Route element={<Public redirect={routes.home} />}>
        <Route path={routes.login} element={<LoginPage />} />
        <Route path={routes.register} element={<RegisterPage />} />
        <Route
          path={routes.passwordResetRequest}
          element={<PasswordResetRequestPage />}
        />
        <Route
          path={routes.passwordResetConfirm}
          element={<PasswordResetConfirmPage />}
        />
      </Route>
    );
  };

  const PrivateRoutes = () => {
    return (
      <Route element={<Private redirect={routes.login} />}>
        <Route path={routes.home} element={<h1>Private Route</h1>} />
        <Route path={routes.systemHealth} element={<SystemHealthPage />} />
      </Route>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route>
          {PublicRoutes()}
          {PrivateRoutes()}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
