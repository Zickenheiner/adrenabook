import { z } from 'zod';

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'L’email est obligatoire')
    .email('Format d’email invalide'),
});

export type PasswordResetRequestFormData = z.infer<
  typeof passwordResetRequestSchema
>;
