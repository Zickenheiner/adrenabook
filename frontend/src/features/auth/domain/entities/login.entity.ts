import type { UserRole } from '../../data/dtos/login.dto';

export interface AuthenticatedUserEntity {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginEntity {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUserEntity;
}
