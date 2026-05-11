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
};

export default endpoints;
