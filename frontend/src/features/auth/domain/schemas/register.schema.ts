import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 12;
const MIN_AGE_YEARS = 18;

const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasDigit = (value: string) => /\d/.test(value);
const hasSpecialChar = (value: string) =>
  /[!@#$%^&*()_+\-={}[\]:;"'<>,.?/~`|\\]/.test(value);

const isAdult = (isoDate: string) => {
  if (!isoDate) return false;
  const birth = new Date(isoDate);
  if (Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= MIN_AGE_YEARS;
};

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'L’email est obligatoire')
      .email('Format d’email invalide'),
    password: z
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
    firstName: z
      .string()
      .min(1, 'Le prénom est obligatoire')
      .max(50, 'Le prénom est trop long'),
    lastName: z
      .string()
      .min(1, 'Le nom est obligatoire')
      .max(50, 'Le nom est trop long'),
    birthDate: z
      .string()
      .min(1, 'La date de naissance est obligatoire')
      .refine(isAdult, {
        message: 'Vous devez avoir au moins 18 ans pour vous inscrire',
      }),
    acceptCgu: z.literal(true, {
      message: 'Vous devez accepter les CGU',
    }),
    acceptRgpd: z.literal(true, {
      message: 'Vous devez accepter la politique RGPD',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const PASSWORD_RULES = {
  minLength: PASSWORD_MIN_LENGTH,
  hasUppercase,
  hasDigit,
  hasSpecialChar,
} as const;
