import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthProfileDto,
  HealthProfileResponseDto,
} from '@features/auth/domains/dtos/user.dto';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';

@ApiTags('Health Profile')
@Controller('users/me')
export class HealthProfileController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @ApiOperation({
    summary: 'Mettre a jour le profil de sante (US-05)',
    description:
      "Met a jour les donnees de sante de l'aventurier connecte. Les contre-indications medicales sont chiffrees en AES-256 en base de donnees. Auth JWT requise.",
  })
  @ApiBody({
    type: HealthProfileDto,
    description: "Donnees de sante de l'aventurier",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Profil sante mis a jour',
    type: HealthProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation echouee',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifie',
  })
  @Patch('health-profile')
  @HttpCode(HttpStatus.OK)
  async updateHealthProfile(
    @Req() req: { user: { sub: string } },
    @Body() dto: HealthProfileDto,
  ): Promise<HealthProfileResponseDto> {
    const userId = req.user.sub;
    return this.userService.updateHealthProfile(userId, dto);
  }
}
