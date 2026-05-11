import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L’email est obligatoire')
    .email('Format d’email invalide'),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
  twoFactorCode: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{6}$/.test(value), {
      message: 'Le code 2FA doit contenir 6 chiffres',
    }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
