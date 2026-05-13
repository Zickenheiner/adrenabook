import { z } from 'zod';

export const rgpdDeleteSchema = z.object({
  confirmationCode: z
    .string()
    .min(1, 'Le code de confirmation est requis')
    .min(6, 'Le code doit contenir au moins 6 caractères'),
  reason: z.string().optional(),
});

export type RgpdDeleteFormData = z.infer<typeof rgpdDeleteSchema>;
