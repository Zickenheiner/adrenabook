import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'banned'], {
    required_error: 'Le statut est obligatoire',
  }),
  reason: z
    .string({ required_error: 'Le justificatif est obligatoire' })
    .min(10, 'Le justificatif doit contenir au moins 10 caractères')
    .max(500, 'Le justificatif ne peut pas dépasser 500 caractères'),
  durationDays: z.coerce
    .number()
    .int()
    .min(1)
    .max(365)
    .optional()
    .or(z.literal(undefined)),
});

export type UpdateUserStatusFormData = z.infer<typeof updateUserStatusSchema>;
