import { z } from 'zod';
import type { SlotPrerequisites } from '../entities/slot-detail.entity';

/**
 * Age atteint a une date donnee, et non age courant : une limite d'age en
 * encadrement sportif s'apprecie le jour de la pratique. Meme regle que le
 * serveur, qui reste seul juge au moment de la reservation.
 */
export function ageAt(birthDate: string, reference: Date): number {
  const birth = new Date(birthDate);
  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && reference.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age;
}

/** Une activite n'impose un poids que si elle borne au moins un cote. */
export function constrainsWeight(prerequisites?: SlotPrerequisites): boolean {
  return (
    prerequisites?.minWeightKg != null || prerequisites?.maxWeightKg != null
  );
}

const baseParticipantSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  birthDate: z
    .string()
    .min(1, 'La date de naissance est requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ'),
  // La conversion depuis la valeur texte de l'input est faite dans le champ
  // (onChange), pas ici : z.coerce donnerait au schema un type d'entree
  // `unknown`, que le resolver React Hook Form ne sait pas reconcilier.
  weightKg: z.number().positive('Le poids doit être positif').optional(),
});

export type BookingParticipantFormData = z.infer<typeof baseParticipantSchema>;

/**
 * Le schema depend du creneau reserve : les bornes d'age et de poids viennent
 * de l'activite, et l'age se mesure a la date de la seance. Les valider ici
 * evite un aller-retour serveur pour une erreur de saisie ; le serveur les
 * revalide, un client ne pouvant pas faire autorite.
 */
export function buildCreateBookingSchema(options?: {
  prerequisites?: SlotPrerequisites;
  slotStartAt?: Date;
}) {
  const prerequisites = options?.prerequisites;
  const slotStartAt = options?.slotStartAt;

  const participantSchema = baseParticipantSchema.superRefine((value, ctx) => {
    if (!prerequisites || !slotStartAt) return;

    const { minAge, maxAge, minWeightKg, maxWeightKg } = prerequisites;
    const age = ageAt(value.birthDate, slotStartAt);

    if (!Number.isNaN(age)) {
      if (minAge != null && age < minAge) {
        ctx.addIssue({
          code: 'custom',
          path: ['birthDate'],
          message: `${minAge} ans minimum le jour de l'activité (${age} ans).`,
        });
      }
      if (maxAge != null && age > maxAge) {
        ctx.addIssue({
          code: 'custom',
          path: ['birthDate'],
          message: `${maxAge} ans maximum pour cette activité (${age} ans).`,
        });
      }
    }

    if (!constrainsWeight(prerequisites)) return;

    if (value.weightKg == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['weightKg'],
        message: 'Le poids est requis pour cette activité.',
      });
      return;
    }
    if (minWeightKg != null && value.weightKg < minWeightKg) {
      ctx.addIssue({
        code: 'custom',
        path: ['weightKg'],
        message: `${minWeightKg} kg minimum pour cette activité.`,
      });
    }
    if (maxWeightKg != null && value.weightKg > maxWeightKg) {
      ctx.addIssue({
        code: 'custom',
        path: ['weightKg'],
        message: `${maxWeightKg} kg maximum pour cette activité.`,
      });
    }
  });

  return z.object({
    slotId: z.string().min(1, 'Le créneau est requis'),
    participants: z
      .array(participantSchema)
      .min(1, 'Au moins un participant est requis'),
    acceptCenterTerms: z.boolean().refine((v) => v === true, {
      message: 'Vous devez accepter les conditions du centre',
    }),
  });
}

export type CreateBookingFormData = z.infer<
  ReturnType<typeof buildCreateBookingSchema>
>;
