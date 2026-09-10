export interface NotificationEmailPreferencesEntity {
  bookingConfirmation: boolean;
  reminders: boolean;
  marketing: boolean;
}

export interface NotificationSmsPreferencesEntity {
  bookingConfirmation: boolean;
  reminders: boolean;
}

export interface NotificationPreferencesEntity {
  updated: boolean;
  email: NotificationEmailPreferencesEntity;
  sms: NotificationSmsPreferencesEntity;
}
