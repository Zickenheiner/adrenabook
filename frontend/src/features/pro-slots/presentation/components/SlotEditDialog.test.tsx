import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlotEditDialog from './SlotEditDialog';
import type { ProSlotEntity } from '../../domain/entities/slot.entity';

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never;

const buildSlot = (overrides: Partial<ProSlotEntity> = {}): ProSlotEntity => ({
  id: 'slot-1',
  startAt: new Date(2027, 2, 10, 11, 0),
  durationMinutes: 90,
  maxParticipants: 10,
  remainingSeats: 10,
  priceEur: 85,
  ...overrides,
});

const renderDialog = (
  slot: ProSlotEntity,
  props: Partial<React.ComponentProps<typeof SlotEditDialog>> = {},
) => {
  const onSubmit = vi.fn();
  const onClose = vi.fn();
  render(
    <SlotEditDialog
      slot={slot}
      isPending={false}
      error={null}
      onClose={onClose}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { onSubmit, onClose };
};

const seatsField = () =>
  screen.getByLabelText(/Participants max/i) as HTMLInputElement;
const dateField = () =>
  screen.getByLabelText(/Date et heure/i) as HTMLInputElement;
const submitButton = () => screen.getByRole('button', { name: /Enregistrer/i });

describe('SlotEditDialog', () => {
  it('préremplit les valeurs du créneau', () => {
    renderDialog(buildSlot());

    expect(dateField().value).toBe('2027-03-10T11:00');
    expect(seatsField().value).toBe('10');
  });

  it('transmet les modifications', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog(buildSlot());

    await user.clear(seatsField());
    await user.type(seatsField(), '15');
    await user.click(submitButton());

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ maxParticipants: 15 }),
    );
  });

  it('empêche de déplacer un créneau réservé', () => {
    // 3 places prises sur 10.
    renderDialog(buildSlot({ remainingSeats: 7 }));

    expect(dateField()).toBeDisabled();
    expect(screen.getByText(/3 places déjà réservées/i)).toBeTruthy();
  });

  it('empêche de descendre sous les places déjà réservées', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog(buildSlot({ remainingSeats: 5 }));

    await user.clear(seatsField());
    await user.type(seatsField(), '2');

    expect(submitButton()).toBeDisabled();
    await user.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('autorise à augmenter les places d’un créneau réservé', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog(buildSlot({ remainingSeats: 5 }));

    await user.clear(seatsField());
    await user.type(seatsField(), '20');
    await user.click(submitButton());

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ maxParticipants: 20 }),
    );
  });

  it('affiche le refus renvoyé par le serveur', () => {
    renderDialog(buildSlot(), {
      error: new Error('3 réservations en cours.'),
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/3 réservations/i);
  });
});
