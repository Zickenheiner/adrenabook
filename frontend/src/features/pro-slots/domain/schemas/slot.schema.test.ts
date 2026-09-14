import { createSlotSchema } from './slot.schema';

describe('createSlotSchema', () => {
  it('accepte un créneau ponctuel même si la récurrence est initialisée à vide', () => {
    const result = createSlotSchema.safeParse({
      slotType: 'single',
      singleStartAt: '2030-06-01T10:00',
      recurrence: { rrule: '', untilDate: '' },
      maxParticipants: 10,
    });

    expect(result.success).toBe(true);
  });

  it('refuse un créneau ponctuel sans date de début', () => {
    const result = createSlotSchema.safeParse({
      slotType: 'single',
      singleStartAt: '',
      recurrence: { rrule: '', untilDate: '' },
      maxParticipants: 10,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['singleStartAt']);
  });

  it('refuse un créneau récurrent sans règle de récurrence', () => {
    const result = createSlotSchema.safeParse({
      slotType: 'recurring',
      singleStartAt: '',
      recurrence: { rrule: '  ', untilDate: '' },
      maxParticipants: 10,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['recurrence', 'rrule']);
  });

  it('accepte un créneau récurrent avec une règle', () => {
    const result = createSlotSchema.safeParse({
      slotType: 'recurring',
      recurrence: { rrule: 'FREQ=WEEKLY;BYDAY=MO', untilDate: '' },
      maxParticipants: 10,
    });

    expect(result.success).toBe(true);
  });
});
