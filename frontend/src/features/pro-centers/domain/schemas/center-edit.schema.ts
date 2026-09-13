import { z } from 'zod';

/**
 * Champs qu'un professionnel peut corriger lui-meme.
 *
 * Le SIRET n'y figure pas, pas plus que les justificatifs ou le representant
 * legal : ils fondent la decision d'instruction du dossier, et l'API les
 * refuse.
 */
export const centerEditSchema = z.object({
  companyName: z.string().min(1, 'Le nom de la société est obligatoire'),
  contactEmail: z.email('Email invalide'),
  contactPhone: z.string().min(1, 'Le téléphone est obligatoire'),
  address: z.object({
    street: z.string().min(1, 'La rue est obligatoire'),
    city: z.string().min(1, 'La ville est obligatoire'),
    postalCode: z
      .string()
      .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),
    country: z.string().min(1, 'Le pays est obligatoire'),
  }),
});

export type CenterEditFormData = z.infer<typeof centerEditSchema>;
