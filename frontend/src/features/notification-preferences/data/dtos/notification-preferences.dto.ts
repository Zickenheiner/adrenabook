export interface NotificationChannelEmailDto {
  bookingConfirmation: boolean;
  reminders: boolean;
  marketing: boolean;
}

export interface NotificationChannelSmsDto {
  bookingConfirmation: boolean;
  reminders: boolean;
}

export interface NotificationPreferencesRequestDto {
  email: NotificationChannelEmailDto;
  sms: NotificationChannelSmsDto;
}

export interface NotificationPreferencesResponseDto {
  updated: boolean;
  preferences: NotificationPreferencesRequestDto;
}
