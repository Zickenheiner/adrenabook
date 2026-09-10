import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { IS_PUBLIC_KEY } from '@core/decorators/public.decorator';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let reflector: Reflector;

  const buildExecutionContext = (): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AccessTokenGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when the route is marked as public', () => {
    const ctx = buildExecutionContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  });

  it('should delegate to the parent AuthGuard when the route is not public', () => {
    const ctx = buildExecutionContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const parentSpy = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true as unknown as boolean);

    const result = guard.canActivate(ctx);

    expect(parentSpy).toHaveBeenCalledWith(ctx);
    expect(result).toBe(true);

    parentSpy.mockRestore();
  });

  it('should delegate to the parent AuthGuard when the public flag is undefined', () => {
    const ctx = buildExecutionContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const parentSpy = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(false as unknown as boolean);

    const result = guard.canActivate(ctx);

    expect(parentSpy).toHaveBeenCalledWith(ctx);
    expect(result).toBe(false);

    parentSpy.mockRestore();
  });
});
