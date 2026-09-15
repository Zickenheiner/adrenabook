import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlotForm from './SlotForm';

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never;

describe('SlotForm — type de créneau', () => {
  it('bascule de Ponctuel vers Récurrent puis revient sur Ponctuel', async () => {
    const user = userEvent.setup();
    render(
      <SlotForm
        onSubmit={() => {}}
        isPending={false}
        activityDurationMinutes={60}
        activityPriceEur={40}
      />,
    );

    await user.click(screen.getByText('Récurrent'));
    expect(screen.getByLabelText(/Date de fin de récurrence/i)).toBeTruthy();

    await user.click(screen.getByText('Ponctuel'));
    expect(screen.queryByLabelText(/Date de fin de récurrence/i)).toBeNull();
    expect(screen.getByLabelText(/Date et heure de début/i)).toBeTruthy();
  });
});

describe('SlotForm — soumission', () => {
  it('soumet un créneau ponctuel avec une date valide', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SlotForm
        onSubmit={onSubmit}
        isPending={false}
        activityDurationMinutes={60}
        activityPriceEur={40}
      />,
    );

    await user.type(
      screen.getByLabelText(/Date et heure de début/i),
      '2030-06-01T10:00',
    );
    await user.click(
      screen.getByRole('button', { name: /Créer les créneaux/i }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      singleStartAt: '2030-06-01T10:00',
      durationMinutes: 60,
      priceEur: 40,
    });
  });
});

describe('SlotForm — fuseau horaire', () => {
  it('joint le fuseau du professionnel à la récurrence', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SlotForm
        onSubmit={onSubmit}
        isPending={false}
        activityDurationMinutes={60}
        activityPriceEur={40}
      />,
    );

    await user.click(screen.getByText('Récurrent'));
    await user.click(
      screen.getByRole('button', { name: /Créer les créneaux/i }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].recurrence.timezone).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  });
});
