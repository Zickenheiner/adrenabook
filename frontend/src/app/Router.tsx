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
import ActivitySearchPage from '@/features/activity-search/presentation/pages/ActivitySearchPage';
import ActivityDetailPage from '@/features/activity-detail/presentation/pages/ActivityDetailPage';
import CenterMapPage from '@/features/center-map/presentation/pages/CenterMapPage';
import BookingPage from '@/features/booking/presentation/pages/BookingPage';
import BookingConfirmationPage from '@/features/booking/presentation/pages/BookingConfirmationPage';
import WaiverSignPage from '@/features/waiver/presentation/pages/WaiverSignPage';

export default function Router() {
  const PublicRoutes = () => {
    return (
      <Route element={<Public redirect={routes.home} />}>
        <Route path={routes.activitySearch} element={<ActivitySearchPage />} />
        <Route path={routes.activityDetail} element={<ActivityDetailPage />} />
        <Route path={routes.centerMap} element={<CenterMapPage />} />
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
        <Route path={routes.bookingNew} element={<BookingPage />} />
        <Route
          path={routes.bookingConfirmation}
          element={<BookingConfirmationPage />}
        />
        <Route path={routes.waiverSign} element={<WaiverSignPage />} />
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
