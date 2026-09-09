import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import {
  LoginDto,
  LoginResponseDto,
  PasswordResetConfirmDto,
  PasswordResetConfirmResponseDto,
  PasswordResetRequestDto,
  PasswordResetRequestResponseDto,
  RefreshTokenDto,
  RegisterDto,
  RegisterResponseDto,
} from '@features/auth/domains/dtos/user.dto';

/**
 * Mock du service injecte via le token string 'IUserService'.
 * Seules les methodes utilisees par le controller sont mockees.
 */
interface UserServiceMock {
  register: jest.Mock;
  login: jest.Mock;
  refreshTokens: jest.Mock;
  requestPasswordReset: jest.Mock;
  confirmPasswordReset: jest.Mock;
}

describe('AuthController', () => {
  let controller: AuthController;
  let userService: UserServiceMock;
  let response: { cookie: jest.Mock };

  const loginResponse: LoginResponseDto = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: {
      id: '68b4d59919d9b7a94b4fde21',
      email: 'user@example.com',
      role: 'aventurier',
    },
  };

  /**
   * Construit une requete Express minimale (headers, ip et cookies).
   */
  const buildRequest = (
    overrides: {
      headers?: Record<string, string | undefined>;
      ip?: string;
      cookies?: Record<string, string>;
    } = {},
  ): Request =>
    ({
      headers: overrides.headers ?? {},
      ip: overrides.ip,
      cookies: overrides.cookies,
    }) as unknown as Request;

  const buildResponse = (): Response => response as unknown as Response;

  beforeEach(async () => {
    userService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshTokens: jest.fn(),
      requestPasswordReset: jest.fn(),
      confirmPasswordReset: jest.fn(),
    };
    response = { cookie: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'IUserService',
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register()', () => {
    const dto: RegisterDto = {
      email: 'user@example.com',
      password: 'Str0ng!Passw0rd',
      firstName: 'Jean',
      lastName: 'Dupont',
      birthDate: '1995-05-15',
      acceptCgu: true,
      acceptRgpd: true,
    } as RegisterDto;

    it('should delegate to the user service and return its result', async () => {
      const expected: RegisterResponseDto = {
        userId: '68b4d59919d9b7a94b4fde21',
        email: 'user@example.com',
        emailVerificationSent: true,
      };
      userService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(userService.register).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });

    it('should propagate a 409 conflict when the email is already used', async () => {
      const error = new Error('Email deja utilise');
      userService.register.mockRejectedValue(error);

      await expect(controller.register(dto)).rejects.toBe(error);
    });
  });

  describe('login()', () => {
    const dto: LoginDto = {
      email: 'user@example.com',
      password: 'Str0ng!Passw0rd',
    };

    it('should forward the x-forwarded-for header and the user agent as login context', async () => {
      userService.login.mockResolvedValue(loginResponse);
      const req = buildRequest({
        headers: { 'x-forwarded-for': '203.0.113.7', 'user-agent': 'jest-ua' },
        ip: '127.0.0.1',
      });

      const result = await controller.login(dto, req, buildResponse());

      expect(userService.login).toHaveBeenCalledWith(dto, {
        ipAddress: '203.0.113.7',
        userAgent: 'jest-ua',
      });
      expect(result).toBe(loginResponse);
    });

    it('should fall back to req.ip when x-forwarded-for is absent', async () => {
      userService.login.mockResolvedValue(loginResponse);
      const req = buildRequest({ headers: {}, ip: '127.0.0.1' });

      await controller.login(dto, req, buildResponse());

      expect(userService.login).toHaveBeenCalledWith(dto, {
        ipAddress: '127.0.0.1',
        userAgent: undefined,
      });
    });

    it('should set a httpOnly refresh_token cookie with a 7 days max age', async () => {
      userService.login.mockResolvedValue(loginResponse);

      await controller.login(dto, buildRequest(), buildResponse());

      expect(response.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        },
      );
    });

    it('should mark the cookie as secure in production', async () => {
      process.env.NODE_ENV = 'production';
      userService.login.mockResolvedValue(loginResponse);

      await controller.login(dto, buildRequest(), buildResponse());

      expect(response.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({ secure: true }),
      );
    });

    it('should propagate a 401 when credentials are invalid and never set a cookie', async () => {
      const error = new UnauthorizedException('Identifiants invalides');
      userService.login.mockRejectedValue(error);

      await expect(
        controller.login(dto, buildRequest(), buildResponse()),
      ).rejects.toBe(error);
      expect(response.cookie).not.toHaveBeenCalled();
    });
  });

  describe('refresh()', () => {
    it('should use the refresh token provided in the body', async () => {
      userService.refreshTokens.mockResolvedValue(loginResponse);
      const dto: RefreshTokenDto = { refreshToken: 'body-token' };

      const result = await controller.refresh(
        dto,
        buildRequest({ cookies: { refresh_token: 'cookie-token' } }),
        buildResponse(),
      );

      expect(userService.refreshTokens).toHaveBeenCalledWith('body-token');
      expect(result).toBe(loginResponse);
    });

    it('should fall back to the refresh_token cookie when the body is empty', async () => {
      userService.refreshTokens.mockResolvedValue(loginResponse);

      await controller.refresh(
        {} as RefreshTokenDto,
        buildRequest({ cookies: { refresh_token: 'cookie-token' } }),
        buildResponse(),
      );

      expect(userService.refreshTokens).toHaveBeenCalledWith('cookie-token');
    });

    it('should rotate the refresh_token cookie with the new token', async () => {
      userService.refreshTokens.mockResolvedValue({
        ...loginResponse,
        refreshToken: 'rotated-token',
      });

      await controller.refresh(
        { refreshToken: 'body-token' },
        buildRequest(),
        buildResponse(),
      );

      expect(response.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rotated-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        },
      );
    });

    it('should throw a 401 when no refresh token is provided at all', async () => {
      await expect(
        controller.refresh(
          {} as RefreshTokenDto,
          buildRequest(),
          buildResponse(),
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.refreshTokens).not.toHaveBeenCalled();
      expect(response.cookie).not.toHaveBeenCalled();
    });

    it('should throw a 401 when the dto is undefined and no cookie is present', async () => {
      await expect(
        controller.refresh(
          undefined as unknown as RefreshTokenDto,
          buildRequest(),
          buildResponse(),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate a 401 when the refresh token has already been rotated', async () => {
      const error = new UnauthorizedException('Refresh token invalide');
      userService.refreshTokens.mockRejectedValue(error);

      await expect(
        controller.refresh(
          { refreshToken: 'stale-token' },
          buildRequest(),
          buildResponse(),
        ),
      ).rejects.toBe(error);
      expect(response.cookie).not.toHaveBeenCalled();
    });

    it('should propagate a 403 when the account is suspended', async () => {
      const error = new Error('Compte suspendu');
      userService.refreshTokens.mockRejectedValue(error);

      await expect(
        controller.refresh(
          { refreshToken: 'valid-token' },
          buildRequest(),
          buildResponse(),
        ),
      ).rejects.toBe(error);
    });
  });

  describe('requestPasswordReset()', () => {
    const dto: PasswordResetRequestDto = { email: 'user@example.com' };

    it('should delegate to the user service and return the generic message', async () => {
      const expected: PasswordResetRequestResponseDto = {
        message: 'Si un compte existe, un email a ete envoye',
      };
      userService.requestPasswordReset.mockResolvedValue(expected);

      const result = await controller.requestPasswordReset(dto);

      expect(userService.requestPasswordReset).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });

    it('should propagate service errors', async () => {
      const error = new Error('SMTP indisponible');
      userService.requestPasswordReset.mockRejectedValue(error);

      await expect(controller.requestPasswordReset(dto)).rejects.toBe(error);
    });
  });

  describe('confirmPasswordReset()', () => {
    const dto: PasswordResetConfirmDto = {
      token: 'reset-token',
      newPassword: 'N3w!Passw0rd',
    };

    it('should delegate to the user service and return the confirmation message', async () => {
      const expected: PasswordResetConfirmResponseDto = {
        message: 'Mot de passe modifie',
      };
      userService.confirmPasswordReset.mockResolvedValue(expected);

      const result = await controller.confirmPasswordReset(dto);

      expect(userService.confirmPasswordReset).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });

    it('should propagate a 400 when the reset token is invalid or expired', async () => {
      const error = new Error('Token invalide ou expire');
      userService.confirmPasswordReset.mockRejectedValue(error);

      await expect(controller.confirmPasswordReset(dto)).rejects.toBe(error);
    });
  });
});
