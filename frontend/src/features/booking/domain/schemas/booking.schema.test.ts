import { buildCreateBookingSchema, ageAt } from './booking.schema';

const SLOT_DATE = new Date('2027-06-15T09:00:00.000Z');

const booking = (participant: Record<string, unknown>) => ({
  slotId: 'slot-1',
  participants: [{ firstName: 'Lou', lastName: 'Martin', ...participant }],
  acceptCenterTerms: true,
});

const issuesOn = (
  result: ReturnType<ReturnType<typeof buildCreateBookingSchema>['safeParse']>,
  field: string,
) =>
  result.success
    ? []
    : result.error.issues.filter((i) => i.path.includes(field));

describe('ageAt', () => {
  it("compte l'âge à la date de référence, pas aujourd'hui", () => {
    expect(ageAt('2015-03-01', SLOT_DATE)).toBe(12);
  });

  it("ne compte pas l'année si l'anniversaire tombe après la date", () => {
    expect(ageAt('2015-09-01', SLOT_DATE)).toBe(11);
  });
});

describe('buildCreateBookingSchema — prérequis', () => {
  it('refuse un participant trop jeune le jour du créneau', () => {
    const schema = buildCreateBookingSchema({
      prerequisites: { minAge: 12, medicalCertificateRequired: false },
      slotStartAt: SLOT_DATE,
    });

    const result = schema.safeParse(booking({ birthDate: '2017-01-01' }));

    expect(result.success).toBe(false);
    expect(issuesOn(result, 'birthDate')[0].message).toMatch(/12 ans minimum/);
  });

  it("accepte celui qui atteint l'âge requis avant le créneau", () => {
    const schema = buildCreateBookingSchema({
      prerequisites: { minAge: 12, medicalCertificateRequired: false },
      slotStartAt: SLOT_DATE,
    });

    expect(schema.safeParse(booking({ birthDate: '2015-03-01' })).success).toBe(
      true,
    );
  });

  it("refuse un participant au-delà de l'âge maximum", () => {
    const schema = buildCreateBookingSchema({
      prerequisites: {
        minAge: 8,
        maxAge: 60,
        medicalCertificateRequired: false,
      },
      slotStartAt: SLOT_DATE,
    });

    const result = schema.safeParse(booking({ birthDate: '1950-01-01' }));
    expect(issuesOn(result, 'birthDate')[0].message).toMatch(/60 ans maximum/);
  });

  it('exige le poids quand l’activité le borne', () => {
    const schema = buildCreateBookingSchema({
      prerequisites: {
        minAge: 8,
        minWeightKg: 40,
        medicalCertificateRequired: false,
      },
      slotStartAt: SLOT_DATE,
    });

    const result = schema.safeParse(booking({ birthDate: '1990-01-01' }));
    expect(issuesOn(result, 'weightKg')[0].message).toMatch(/requis/);
  });

  it('refuse un poids hors bornes', () => {
    const schema = buildCreateBookingSchema({
      prerequisites: {
        minAge: 8,
        minWeightKg: 40,
        maxWeightKg: 110,
        medicalCertificateRequired: false,
      },
      slotStartAt: SLOT_DATE,
    });

    const result = schema.safeParse(
      booking({ birthDate: '1990-01-01', weightKg: 120 }),
    );
    expect(issuesOn(result, 'weightKg')[0].message).toMatch(/110 kg maximum/);
  });

  it("n'exige pas le poids quand l'activité ne le borne pas", () => {
    const schema = buildCreateBookingSchema({
      prerequisites: { minAge: 8, medicalCertificateRequired: false },
      slotStartAt: SLOT_DATE,
    });

    expect(schema.safeParse(booking({ birthDate: '1990-01-01' })).success).toBe(
      true,
    );
  });

  it('ne valide que le format tant que le créneau n’est pas chargé', () => {
    const schema = buildCreateBookingSchema();

    // Sans prérequis connus, aucune règle d'âge ne doit bloquer la saisie.
    expect(schema.safeParse(booking({ birthDate: '2020-01-01' })).success).toBe(
      true,
    );
    expect(schema.safeParse(booking({ birthDate: 'hier' })).success).toBe(
      false,
    );
  });
});
