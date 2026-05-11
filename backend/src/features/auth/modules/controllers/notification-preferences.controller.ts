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
  NotificationPreferencesDto,
  NotificationPreferencesResponseDto,
} from '@features/auth/domains/dtos/user.dto';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';

@ApiTags('Notification Preferences')
@Controller('users/me')
export class NotificationPreferencesController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @ApiOperation({
    summary: 'Mettre a jour les preferences de notifications (US-14)',
    description:
      "Met a jour les preferences de notifications email et SMS de l'aventurier connecte. Permet l'opt-out par canal. Auth JWT requise.",
  })
  @ApiBody({
    type: NotificationPreferencesDto,
    description: 'Preferences de notifications email et SMS',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences de notifications mises a jour',
    type: NotificationPreferencesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation echouee',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifie',
  })
  @Patch('notification-preferences')
  @HttpCode(HttpStatus.OK)
  async updateNotificationPreferences(
    @Req() req: { user: { sub: string } },
    @Body() dto: NotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    const userId = req.user.sub;
    return this.userService.updateNotificationPreferences(userId, dto);
  }
}
