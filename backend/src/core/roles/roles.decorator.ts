import { SetMetadata } from '@nestjs/common';

/**
 * Roles applicatifs (toujours en minuscules, comme dans le payload JWT).
 */
export type AppRole = 'aventurier' | 'professionnel' | 'admin';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
