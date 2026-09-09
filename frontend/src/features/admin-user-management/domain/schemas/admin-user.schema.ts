import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'banned'], {
    error: 'Le statut est obligatoire',
  }),
  reason: z
    .string({ error: 'Le justificatif est obligatoire' })
    .min(10, 'Le justificatif doit contenir au moins 10 caractères')
    .max(500, 'Le justificatif ne peut pas dépasser 500 caractères'),
  // Le champ convertit deja la saisie en nombre dans son onChange : z.coerce
  // serait redondant et donnerait au schema un type d'entree `unknown`.
  durationDays: z.number().int().min(1).max(365).optional(),
});

export type UpdateUserStatusFormData = z.infer<typeof updateUserStatusSchema>;
