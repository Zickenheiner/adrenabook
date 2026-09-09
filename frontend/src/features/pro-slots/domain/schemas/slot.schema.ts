import { z } from 'zod';

export const recurrenceSchema = z.object({
  rrule: z.string().min(1, 'La règle de récurrence est requise'),
  untilDate: z.string().min(1, 'La date de fin est requise'),
});

export const createSlotSchema = z
  .object({
    slotType: z.enum(['single', 'recurring']),
    singleStartAt: z.string().optional(),
    recurrence: recurrenceSchema.optional(),
    durationMinutes: z
      .number({ error: 'Durée requise' })
      .min(15, 'Durée minimum : 15 minutes')
      .max(1440, 'Durée maximum : 24h'),
    maxParticipants: z
      .number({ error: 'Nombre de participants requis' })
      .min(1, 'Au moins 1 participant'),
    priceEur: z
      .number({ error: 'Prix requis' })
      .min(0, 'Le prix ne peut pas être négatif'),
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
