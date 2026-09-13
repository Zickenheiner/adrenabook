import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ActivitySlots from './ActivitySlots';

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never;

const mockUseActivitySlots = vi.fn();

vi.mock('../../domain/hooks/activity-detail.hook', () => ({
  useActivitySlots: (id: string, month: string) =>
    mockUseActivitySlots(id, month),
}));

/** Deux créneaux le même jour, un le lendemain, dans un mois futur fixe. */
const slots = [
  {
    id: 'slot-1',
    startAt: new Date(2027, 2, 10, 11, 0),
    remainingSeats: 8,
    priceEur: 85,
  },
  {
    id: 'slot-2',
    startAt: new Date(2027, 2, 10, 16, 0),
    remainingSeats: 0,
    priceEur: 85,
  },
  {
    id: 'slot-3',
    startAt: new Date(2027, 2, 21, 9, 0),
    remainingSeats: 4,
    priceEur: 85,
  },
];

const answer = (overrides: Record<string, unknown> = {}) => ({
  slots,
  availableMonths: ['2027-03', '2027-05'],
  slotsAreLoading: false,
  slotsError: null,
  ...overrides,
});

const renderSlots = () =>
  render(
    <MemoryRouter>
      <ActivitySlots activityId="activity-1" />
    </MemoryRouter>,
  );

describe('ActivitySlots', () => {
  beforeEach(() => {
    // Le composant ouvre le mois courant : on fige la date pour que ce soit
    // mars 2027. shouldAdvanceTime laisse user-event progresser normalement.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2027, 2, 1));
    mockUseActivitySlots.mockReturnValue(answer());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('demande les créneaux du mois affiché', () => {
    renderSlots();

    expect(mockUseActivitySlots).toHaveBeenCalledWith('activity-1', '2027-03');
  });

  it('présélectionne le premier jour disponible plutôt qu’un panneau vide', () => {
    renderSlots();

    expect(screen.getByText(/mercredi 10 mars/i)).toBeTruthy();
    expect(screen.getByText('11:00')).toBeTruthy();
    expect(screen.getByText('16:00')).toBeTruthy();
    // Le 21 appartient à un autre jour : ses horaires ne sont pas affichés.
    expect(screen.queryByText('09:00')).toBeNull();
  });

  it('affiche les horaires du jour choisi dans le calendrier', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSlots();

    await user.click(screen.getByRole('button', { name: /21 mars/i }));

    expect(screen.getByText(/dimanche 21 mars/i)).toBeTruthy();
    expect(screen.getByText('09:00')).toBeTruthy();
    expect(screen.queryByText('11:00')).toBeNull();
  });

  it('rend non cliquables les jours sans créneau', () => {
    renderSlots();

    // Le 12 mars n'a aucun créneau : le calendrier doit le désactiver.
    expect(screen.getByRole('button', { name: /12 mars/i })).toBeDisabled();
  });

  it('interdit la réservation d’un créneau complet', () => {
    renderSlots();

    const rows = screen.getAllByRole('listitem');
    const fullRow = rows.find((row) => within(row).queryByText('Complet'))!;

    expect(
      within(fullRow).getByRole('button', { name: 'Réserver' }),
    ).toBeDisabled();
  });

  it('annonce un mois sans créneau', () => {
    mockUseActivitySlots.mockReturnValue(
      answer({ slots: [], availableMonths: ['2027-05'] }),
    );

    renderSlots();

    expect(screen.getByText(/Aucun créneau en mars 2027/i)).toBeTruthy();
  });

  it('affiche un état de chargement pendant la requête', () => {
    mockUseActivitySlots.mockReturnValue(
      answer({ slots: [], slotsAreLoading: true }),
    );

    renderSlots();

    expect(screen.getByText(/Chargement des créneaux/i)).toBeTruthy();
  });
});
