import {
  Body,
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
  RegisterDto,
  RegisterResponseDto,
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
    summary: "Inscription d'un aventurier (US-01)",
    description:
      'Cree un compte aventurier avec email, mot de passe fort, et acceptation des CGU + RGPD. Envoie un email de verification.',
  })
  @ApiBody({
    type: RegisterDto,
    description: "Donnees d'inscription de l'aventurier",
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Compte cree, email de verification envoye',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation echouee (email invalide, mot de passe faible, mineur, CGU/RGPD non acceptes)',
  })
  @ApiResponse({
    status: 409,
    description: 'Email deja utilise',
  })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.userService.register(dto);
  }

  @ApiOperation({
    summary: 'Connexion securisee (US-02)',
    description:
      'Authentifie un utilisateur via email + mot de passe (et code 2FA si active). Retourne un accessToken (15 min) et un refreshToken (7 jours, egalement defini en cookie httpOnly). Blocage du compte apres 5 tentatives echouees pendant 15 minutes.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Identifiants de connexion',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion reussie',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation echouee' })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides ou 2FA requis',
  })
  @ApiResponse({
    status: 423,
    description: 'Compte verrouille (trop de tentatives)',
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
}
