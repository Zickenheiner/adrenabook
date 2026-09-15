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
    summary: 'Update the health profile',
    description:
      'Updates the health data of the signed-in adventurer. Medical contraindications are AES-256 encrypted in the database. JWT authentication required.',
  })
  @ApiBody({
    type: HealthProfileDto,
    description: 'Health data of the adventurer',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Health profile updated',
    type: HealthProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
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
