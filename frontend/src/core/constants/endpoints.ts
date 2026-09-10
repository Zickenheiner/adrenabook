const endpoints = {
  auth: {
    refresh: '/auth/refresh',
    register: '/auth/register',
    login: '/auth/login',
    passwordResetRequest: '/auth/password-reset/request',
    passwordResetConfirm: '/auth/password-reset/confirm',
  },
  professionalCenter: {
    create: '/professional-center',
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
    list: (activityId: string) => `/pro/activities/${activityId}/slots`,
  },
  uploads: {
    create: '/uploads',
    byId: (id: string) => `/uploads/${id}`,
  },
  slots: {
    byId: (id: string) => `/slots/${id}`,
  },
  activitySearch: {
    search: '/activities/search',
  },
  activityDetail: {
    byId: (id: string) => `/activities/${id}`,
  },
  centerMap: {
    list: '/centers',
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
  adminAuditLogs: {
    list: '/admin/audit-logs',
  },
  rgpd: {
    export: '/users/me/rgpd/export',
    delete: '/users/me/rgpd/delete',
  },
  adventurerDashboard: {
    get: '/users/me/dashboard',
  },
};

export default endpoints;
