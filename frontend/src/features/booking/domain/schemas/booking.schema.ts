import { z } from 'zod';

export const bookingParticipantSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  birthDate: z
    .string()
    .min(1, 'La date de naissance est requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ'),
  weightKg: z.coerce
    .number()
    .positive('Le poids doit être positif')
    .optional()
    .or(z.literal('')),
});

export const createBookingSchema = z.object({
  slotId: z.string().min(1, 'Le créneau est requis'),
  participants: z
    .array(bookingParticipantSchema)
    .min(1, 'Au moins un participant est requis'),
  acceptCenterTerms: z.literal(true, {
    errorMap: () => ({
      message: 'Vous devez accepter les conditions du centre',
    }),
  }),
});

export type BookingParticipantFormData = z.infer<
  typeof bookingParticipantSchema
>;
export type CreateBookingFormData = z.infer<typeof createBookingSchema>;
