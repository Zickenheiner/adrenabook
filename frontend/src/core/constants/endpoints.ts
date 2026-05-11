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
};

export default endpoints;
