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
