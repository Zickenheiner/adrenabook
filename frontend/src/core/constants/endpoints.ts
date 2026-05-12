const endpoints = {
  auth: {
    refresh: '/auth/refresh',
    register: '/auth/register',
    login: '/auth/login',
    passwordResetRequest: '/auth/password-reset/request',
    passwordResetConfirm: '/auth/password-reset/confirm',
  },
  professionalAuth: {
    register: '/auth/register/professional',
  },
  system: {
    health: '/health',
  },
  adminCenters: {
    review: (id: string) => `/admin/centers/${id}/review`,
    list: '/admin/centers',
    byId: (id: string) => `/admin/centers/${id}`,
  },
  healthProfile: {
    update: '/users/me/health-profile',
  },
  proActivities: {
    base: '/pro/activities',
    byId: (id: string) => `/pro/activities/${id}`,
  },
  proSlots: {
    create: (activityId: string) => `/pro/activities/${activityId}/slots`,
  },
  activitySearch: {
    search: '/activities/search',
  },
  activityDetail: {
    byId: (id: string) => `/activities/${id}`,
  },
  centerMap: {
    map: '/centers/map',
  },
  bookings: {
    base: '/bookings',
    byId: (id: string) => `/bookings/${id}`,
  },
  waiver: {
    sign: (bookingId: string) => `/bookings/${bookingId}/waiver/sign`,
  },
  payment: {
    confirmPayment: (bookingId: string) =>
      `/bookings/${bookingId}/confirm-payment`,
  },
  invoice: {
    byBookingId: (bookingId: string) => `/bookings/${bookingId}/invoice`,
  },
  notificationPreferences: {
    update: '/users/me/notification-preferences',
  },
  bookingCancellation: {
    cancel: (bookingId: string) => `/bookings/${bookingId}/cancel`,
  },
  proDashboard: {
    get: '/pro/dashboard',
  },
  proImport: {
    csv: '/pro/imports/csv',
  },
  proAccountingExport: {
    create: '/pro/exports/accounting',
  },
  adminUsers: {
    list: '/admin/users',
    byId: (id: string) => `/admin/users/${id}`,
    updateStatus: (id: string) => `/admin/users/${id}/status`,
  },
};

export default endpoints;
