import { z } from 'zod';

export const recurrenceSchema = z.object({
  rrule: z.string().min(1, 'La règle de récurrence est requise'),
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
    instructorIds: z
      .array(z.string())
      .min(1, 'Au moins un moniteur doit être sélectionné'),
  })
  .refine(
    (data) => {
      if (data.slotType === 'single') return !!data.singleStartAt;
      if (data.slotType === 'recurring') return !!data.recurrence;
      return false;
    },
    {
      message: 'Veuillez fournir une date de début ou une règle de récurrence.',
      path: ['singleStartAt'],
    },
  );

export type CreateSlotFormData = z.infer<typeof createSlotSchema>;
