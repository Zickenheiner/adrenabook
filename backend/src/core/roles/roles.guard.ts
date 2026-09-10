import { AppRole, ROLES_KEY } from '@core/roles/roles.decorator';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Garde de role reutilisable.
 * S'utilise avec le decorateur `@Roles(...)` et suppose que l'authentification
 * a deja ete faite par `AccessTokenGuard` (guard global) : `request.user.role`
 * provient du payload JWT.
 *
 * Sans `@Roles(...)` sur le handler ni sur le controller, l'acces est laisse
 * passer (le controller reste libre de faire un contrôle plus fin, par exemple
 * "proprietaire ou admin").
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    const role = (request.user?.role ?? '').toLowerCase();

    if (!requiredRoles.includes(role as AppRole)) {
      throw new ForbiddenException(
        'Acces refuse : role insuffisant pour cette ressource',
      );
    }
    return true;
  }
}
