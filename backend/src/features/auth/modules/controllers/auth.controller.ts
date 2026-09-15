import {
  Body,
  UnauthorizedException,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '@core/decorators/public.decorator';
import {
  LoginDto,
  LoginResponseDto,
  PasswordResetConfirmDto,
  PasswordResetConfirmResponseDto,
  PasswordResetRequestDto,
  PasswordResetRequestResponseDto,
  RegisterDto,
  RegisterResponseDto,
  RefreshTokenDto,
} from '@features/auth/domains/dtos/user.dto';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';

/**
 * Duree de vie du cookie refresh_token : 7 jours (alignee avec le JWT refresh).
 */
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @ApiOperation({
    summary: 'Adventurer sign-up',
    description:
      'Creates an adventurer account with an email address, a strong password, and acceptance of the terms of service and the GDPR policy. Sends a verification email.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Sign-up data of the adventurer',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Account created, verification email sent',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation failed (invalid email, weak password, user under legal age, terms of service or GDPR policy not accepted)',
  })
  @ApiResponse({
    status: 409,
    description: 'Email address already in use',
  })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.userService.register(dto);
  }

  @ApiOperation({
    summary: 'Secure sign-in',
    description:
      'Authenticates a user with email + password (and a 2FA code when 2FA is enabled). Returns an accessToken (15 min) and a refreshToken (7 days, also set as an httpOnly cookie). The account is locked for 15 minutes after 5 failed attempts.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Sign-in credentials',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Sign-in successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials, or 2FA code required',
  })
  @ApiResponse({
    status: 423,
    description: 'Account locked (too many attempts)',
  })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string | undefined) ?? req.ip;
    const userAgent = req.headers['user-agent'];
    const result = await this.userService.login(dto, {
      ipAddress,
      userAgent,
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: '/',
    });

    return result;
  }

  @ApiOperation({
    summary: 'Renew the token pair',
    description:
      'Exchanges a valid refresh token for a new access token and a new refresh ' +
      'token. The refresh token is rotated on every call: the previous one becomes ' +
      'unusable. The token is read from the request body, or failing that from the ' +
      'httpOnly cookie set at sign-in.',
  })
  @ApiBody({ type: RefreshTokenDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'New token pair',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token missing, invalid, expired or already rotated',
  })
  @ApiResponse({ status: 403, description: 'Account suspended or deactivated' })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    const refreshToken = dto?.refreshToken ?? cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token absent');
    }

    const result = await this.userService.refreshTokens(refreshToken);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: '/',
    });

    return result;
  }

  @ApiOperation({
    summary: 'Password reset request',
    description:
      'Sends a magic link by email, valid for 1 hour, to reset the password. The response is generic (the same message is returned when the email does not exist) in order to prevent user enumeration.',
  })
  @ApiBody({
    type: PasswordResetRequestDto,
    description: 'Email address of the user requesting the password reset',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      'Request accepted (generic response, only indicating that the request has been processed)',
    type: PasswordResetRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (invalid email)',
  })
  @Public()
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: PasswordResetRequestDto,
  ): Promise<PasswordResetRequestResponseDto> {
    return this.userService.requestPasswordReset(dto);
  }

  @ApiOperation({
    summary: 'Password reset confirmation',
    description:
      'Verifies the HMAC-signed token (expires after 1 hour, single use), updates the password and invalidates the existing sessions (refresh tokens). Also resets the failed login attempts counter.',
  })
  @ApiBody({
    type: PasswordResetConfirmDto,
    description: 'Reset token and new password',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: PasswordResetConfirmResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed, invalid or expired token',
  })
  @Public()
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Body() dto: PasswordResetConfirmDto,
  ): Promise<PasswordResetConfirmResponseDto> {
    return this.userService.confirmPasswordReset(dto);
  }
}
