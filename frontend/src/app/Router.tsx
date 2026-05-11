import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Private from './Private';
import Public from './Public';
import routes from '@/core/constants/routes';
import SystemHealthPage from '@/features/system/presentation/pages/SystemHealthPage';
import RegisterPage from '@/features/auth/presentation/pages/RegisterPage';
import LoginPage from '@/features/auth/presentation/pages/LoginPage';
import PasswordResetRequestPage from '@/features/auth/presentation/pages/PasswordResetRequestPage';
import PasswordResetConfirmPage from '@/features/auth/presentation/pages/PasswordResetConfirmPage';
import ProfessionalRegistrationPage from '@/features/professional-registration/presentation/pages/ProfessionalRegistrationPage';
import ProfessionalRegistrationSuccessPage from '@/features/professional-registration/presentation/pages/ProfessionalRegistrationSuccessPage';
import AdminCenterListPage from '@/features/admin-kyc/presentation/pages/AdminCenterListPage';
import AdminCenterReviewPage from '@/features/admin-kyc/presentation/pages/AdminCenterReviewPage';
import HealthProfilePage from '@/features/health-profile/presentation/pages/HealthProfilePage';
import ProActivityListPage from '@/features/pro-activities/presentation/pages/ProActivityListPage';
import ProActivityCreatePage from '@/features/pro-activities/presentation/pages/ProActivityCreatePage';

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
        <Route
          path={routes.professionalRegister}
          element={<ProfessionalRegistrationPage />}
        />
        <Route
          path={routes.professionalRegisterSuccess}
          element={<ProfessionalRegistrationSuccessPage />}
        />
      </Route>
    );
  };

  const PrivateRoutes = () => {
    return (
      <Route element={<Private redirect={routes.login} />}>
        <Route path={routes.home} element={<h1>Private Route</h1>} />
        <Route path={routes.systemHealth} element={<SystemHealthPage />} />
        <Route
          path={routes.adminCenterList}
          element={<AdminCenterListPage />}
        />
        <Route
          path={routes.adminCenterReview}
          element={<AdminCenterReviewPage />}
        />
        <Route path={routes.healthProfile} element={<HealthProfilePage />} />
        <Route
          path={routes.proActivityList}
          element={<ProActivityListPage />}
        />
        <Route
          path={routes.proActivityCreate}
          element={<ProActivityCreatePage />}
        />
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
