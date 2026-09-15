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
    summary: 'Update the notification preferences',
    description:
      'Updates the email and SMS notification preferences of the signed-in adventurer. Allows opting out per channel. JWT authentication required.',
  })
  @ApiBody({
    type: NotificationPreferencesDto,
    description: 'Email and SMS notification preferences',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification preferences updated',
    type: NotificationPreferencesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
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
