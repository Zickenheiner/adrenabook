import { getAccessToken } from '@/core/local/storage';

export type AppRole = 'aventurier' | 'professionnel' | 'admin';

export interface SessionUser {
  id: string;
  email: string;
  role: AppRole;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
}

const decodePayload = (token: string): JwtPayload | null => {
  const segment = token.split('.')[1];
  if (!segment) return null;

  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );
    // decodeURIComponent + escape pour restituer correctement l'UTF-8
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

const normalizeRole = (role?: string): AppRole => {
  const lower = (role ?? '').toLowerCase();
  if (lower === 'professionnel') return 'professionnel';
  if (lower === 'admin') return 'admin';
  return 'aventurier';
};

/**
 * Utilisateur de la session courante, lu depuis le jeton d'acces.
 *
 * Le rôle sert uniquement à adapter la navigation : l'autorisation réelle est
 * appliquée côté API, jamais ici. Masquer un lien n'est pas une protection.
 */
export const getSessionUser = (): SessionUser | null => {
  const token = getAccessToken();
  if (typeof token !== 'string') return null;

  const payload = decodePayload(token);
  if (!payload?.sub) return null;

  return {
    id: payload.sub,
    email: payload.email ?? '',
    role: normalizeRole(payload.role),
  };
};

/** Initiale affichee dans l'avatar, deduite de l'email. */
export const getUserInitial = (user: SessionUser | null): string =>
  user?.email?.trim()?.charAt(0)?.toUpperCase() || '?';
