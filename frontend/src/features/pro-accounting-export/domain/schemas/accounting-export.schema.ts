import { z } from 'zod';

export const accountingExportSchema = z
  .object({
    format: z.enum(['sage50', 'sage100', 'csv_generic'], {
      error: 'Le format est requis',
    }),
    from: z.string().min(1, 'La date de début est requise'),
    to: z.string().min(1, 'La date de fin est requise'),
    // Pas de .default() ici : la valeur initiale est fournie par defaultValues
    // du formulaire. Un .default() ferait diverger les types d'entree et de
    // sortie du schema, ce que le resolver React Hook Form ne sait pas concilier.
    includeRefunds: z.boolean(),
    deliveryMode: z.enum(['download', 'email'], {
      error: 'Le mode de livraison est requis',
    }),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return new Date(data.from) <= new Date(data.to);
    },
    {
      message: 'La date de début doit être antérieure à la date de fin',
      path: ['from'],
    },
  );

export type AccountingExportFormData = z.infer<typeof accountingExportSchema>;
