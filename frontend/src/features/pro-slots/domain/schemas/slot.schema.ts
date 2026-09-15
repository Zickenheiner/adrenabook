import { z } from 'zod';

export const recurrenceSchema = z.object({
  // La regle n'est exigee que pour un creneau recurrent : le formulaire
  // initialise toujours ce sous-objet, y compris en mode ponctuel.
  rrule: z.string(),
  // Sans date de fin, l'API genere la recurrence sur douze mois.
  untilDate: z.string().optional(),
});

export const createSlotSchema = z
  .object({
    slotType: z.enum(['single', 'recurring']),
    singleStartAt: z.string().optional(),
    recurrence: recurrenceSchema.optional(),
    // La duree et le prix sont portes par l'activite : un creneau ne peut pas
    // les contredire, ils ne sont donc pas saisis ici.
    maxParticipants: z
      .number({ error: 'Nombre de participants requis' })
      .min(1, 'Au moins 1 participant'),
  })
  .superRefine((data, ctx) => {
    if (data.slotType === 'single') {
      if (!data.singleStartAt) {
        ctx.addIssue({
          code: 'custom',
          path: ['singleStartAt'],
          message: 'Veuillez fournir une date de début.',
        });
      }
      return;
    }

    if (!data.recurrence?.rrule.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['recurrence', 'rrule'],
        message: 'La règle de récurrence est requise',
      });
    }
  });

export type CreateSlotFormData = z.infer<typeof createSlotSchema>;
