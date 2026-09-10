import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 12;

const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasDigit = (value: string) => /\d/.test(value);
const hasSpecialChar = (value: string) =>
  /[!@#$%^&*()_+\-={}[\]:;"'<>,.?/~`|\\]/.test(value);

export const passwordResetConfirmSchema = z
  .object({
    newPassword: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
      )
      .refine(hasUppercase, {
        message: 'Le mot de passe doit contenir au moins une majuscule',
      })
      .refine(hasDigit, {
        message: 'Le mot de passe doit contenir au moins un chiffre',
      })
      .refine(hasSpecialChar, {
        message: 'Le mot de passe doit contenir au moins un caractère spécial',
      }),
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type PasswordResetConfirmFormData = z.infer<
  typeof passwordResetConfirmSchema
>;

export const PASSWORD_RESET_RULES = {
  minLength: PASSWORD_MIN_LENGTH,
  hasUppercase,
  hasDigit,
  hasSpecialChar,
} as const;
