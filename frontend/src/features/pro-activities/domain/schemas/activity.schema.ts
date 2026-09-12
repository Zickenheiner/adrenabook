import { z } from 'zod';

// Les champs numeriques convertissent la saisie dans leur onChange : z.coerce
// donnerait au schema un type d'entree `unknown`, que le resolver React Hook
// Form ne sait pas reconcilier avec le type de sortie.
const prerequisitesSchema = z.object({
  minAge: z.number({ error: "L'âge minimum est requis" }).min(0).max(120),
  maxAge: z.number().min(0).max(120).optional(),
  minWeightKg: z.number().min(0).optional(),
  maxWeightKg: z.number().min(0).optional(),
  medicalCertificateRequired: z.boolean(),
});

export const createActivitySchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères'),
  type: z.string().min(1, "Le type d'activité est requis"),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    error: 'La difficulté est requise',
  }),
  durationMinutes: z
    .number({ error: 'La durée est requise' })
    .min(1, 'La durée doit être supérieure à 0'),
  priceFromEur: z
    .number({ error: 'Le prix est requis' })
    .min(0, 'Le prix doit être positif'),
  prerequisites: prerequisitesSchema,
  includedEquipment: z.array(z.string()),
  photoFileIds: z.array(z.string()),
  // `pending_admin_review` est attribue par le systeme a la publication : il
  // est accepte ici pour qu'une activite en revision garde son etat a
  // l'edition, mais le formulaire ne le propose pas comme choix.
  status: z.enum(['draft', 'published', 'archived', 'pending_admin_review']),
});

export type CreateActivityFormData = z.infer<typeof createActivitySchema>;
