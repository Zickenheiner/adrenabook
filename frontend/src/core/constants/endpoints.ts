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
};

export default endpoints;
