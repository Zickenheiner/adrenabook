import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@core/decorators/public.decorator';
import {
  RegisterDto,
  RegisterResponseDto,
} from '@features/auth/domains/dtos/user.dto';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';

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
}
