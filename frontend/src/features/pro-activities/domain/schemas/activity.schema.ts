import { z } from 'zod';

const prerequisitesSchema = z.object({
  minAge: z.coerce.number().min(0).max(120),
  maxAge: z.coerce.number().min(0).max(120).optional(),
  minWeightKg: z.coerce.number().min(0).optional(),
  maxWeightKg: z.coerce.number().min(0).optional(),
  medicalCertificateRequired: z.boolean(),
});

export const createActivitySchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères'),
  type: z.string().min(1, "Le type d'activité est requis"),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'La difficulté est requise',
  }),
  durationMinutes: z.coerce
    .number()
    .min(1, 'La durée doit être supérieure à 0'),
  priceFromEur: z.coerce.number().min(0, 'Le prix doit être positif'),
  prerequisites: prerequisitesSchema,
  includedEquipment: z.array(z.string()),
  photoFileIds: z.array(z.string()),
  status: z.enum(['draft', 'published']),
});

export type CreateActivityFormData = z.infer<typeof createActivitySchema>;
