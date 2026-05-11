import { z } from 'zod';

export const cancelBookingSchema = z.object({
  reason: z.enum(['personal', 'health', 'weather', 'other'], {
    required_error: "Veuillez sélectionner un motif d'annulation",
  }),
  comment: z
    .string()
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères')
    .optional(),
});

export type CancelBookingFormData = z.infer<typeof cancelBookingSchema>;
