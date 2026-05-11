import { z } from 'zod';

export const notificationPreferencesSchema = z.object({
  email: z.object({
    bookingConfirmation: z.boolean(),
    reminders: z.boolean(),
    marketing: z.boolean(),
  }),
  sms: z.object({
    bookingConfirmation: z.boolean(),
    reminders: z.boolean(),
  }),
});

export type NotificationPreferencesFormData = z.infer<
  typeof notificationPreferencesSchema
>;
