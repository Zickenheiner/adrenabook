import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { AppRole, ROLES_KEY } from './roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const buildExecutionContext = (user?: unknown): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate()', () => {
    it('should read the required roles from the handler then the class', () => {
      const ctx = buildExecutionContext({ role: 'admin' });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['admin'] as AppRole[]);

      guard.canActivate(ctx);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]);
    });

    it('should return true when no role metadata is present', () => {
      const ctx = buildExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      expect(guard.canActivate(ctx)).toBe(true);
      // Pas de role requis : la requete n'est meme pas lue.
      expect(ctx.switchToHttp).not.toHaveBeenCalled();
    });

    it('should return true when the required roles list is empty', () => {
      const ctx = buildExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should return true when the user carries the required role', () => {
      const ctx = buildExecutionContext({ role: 'admin' });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['admin'] as AppRole[]);

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should return true when the user role matches one of several required roles', () => {
      const ctx = buildExecutionContext({ role: 'professionnel' });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['admin', 'professionnel'] as AppRole[]);

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should be case-insensitive on the role carried by the JWT payload', () => {
      const ctx = buildExecutionContext({ role: 'ADMIN' });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['admin'] as AppRole[]);

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw ForbiddenException when the user role is not allowed', () => {
      const ctx = buildExecutionContext({ role: 'aventurier' });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['admin'] as AppRole[]);

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(ctx)).toThrow(
        'Acces refuse : role insuffisant pour cette ressource',
      );
    });

    it('should throw ForbiddenException when the request carries no user', () => {
      const ctx = buildExecutionContext(undefined);
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['admin'] as AppRole[]);

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when the user has no role property', () => {
      const ctx = buildExecutionContext({});
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['admin'] as AppRole[]);

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });
});
