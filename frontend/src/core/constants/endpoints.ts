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
    mine: '/professional-center/mine',
    byId: (id: string) => `/professional-center/${id}`,
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
  users: {
    byId: (id: string) => `/users/${id}`,
  },
  proActivities: {
    base: '/pro/activities',
    mine: (centerId: string) =>
      `/pro/activities/my?centerId=${encodeURIComponent(centerId)}`,
    createIn: (centerId: string) =>
      `/pro/activities?centerId=${encodeURIComponent(centerId)}`,
    byId: (id: string) => `/pro/activities/${id}`,
  },
  proSlots: {
    create: (activityId: string) => `/pro/activities/${activityId}/slots`,
    list: (activityId: string, month: string) =>
      `/pro/activities/${activityId}/slots?month=${month}`,
    byId: (activityId: string, slotId: string) =>
      `/pro/activities/${activityId}/slots/${slotId}`,
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
    photo: (fileId: string) => `/activities/photos/${fileId}`,
  },
  activityDetail: {
    byId: (id: string) => `/activities/${id}`,
    slotsByMonth: (id: string, month: string) =>
      `/activities/${id}/slots?month=${month}`,
  },
  centerMap: {
    list: '/centers',
  },
  centers: {
    byId: (id: string) => `/centers/${id}`,
  },
  bookings: {
    base: '/bookings',
    mine: '/bookings/me',
    byId: (id: string) => `/bookings/${id}`,
  },
  waiver: {
    sign: (bookingId: string) => `/bookings/${bookingId}/waiver/sign`,
  },
  payment: {
    confirmPayment: (bookingId: string) =>
      `/bookings/${bookingId}/confirm-payment`,
    intent: (bookingId: string) => `/bookings/${bookingId}/payment-intent`,
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
