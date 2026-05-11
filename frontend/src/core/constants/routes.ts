const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  passwordResetRequest: '/password-reset/request',
  passwordResetConfirm: '/password-reset/confirm',
  professionalRegister: '/register/professional',
  professionalRegisterSuccess: '/register/professional/success',
  systemHealth: '/system/health',
  adminCenterList: '/admin/centers',
  adminCenterReview: '/admin/centers/:id/review',
  healthProfile: '/profile/health',
  proActivityList: '/pro/activities',
  proActivityCreate: '/pro/activities/new',
  proSlotManage: '/pro/activities/:id/slots',
  activitySearch: '/activities/search',
  activityDetail: '/activities/:id',
  centerMap: '/centers/map',
  bookingNew: '/bookings/new',
  bookingConfirmation: '/bookings/:id/confirmation',
  waiverSign: '/bookings/:id/waiver',
};

export default routes;
