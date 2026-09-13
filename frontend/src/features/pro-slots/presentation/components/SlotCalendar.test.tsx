import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlotCalendar from './SlotCalendar';

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never;

const mockUseProSlots = vi.fn();

const mockUpdateSlot = vi.fn();
const mockDeleteSlot = vi.fn();

vi.mock('../../domain/hooks/slot.hook', () => ({
  useProSlots: (activityId: string, month: string) =>
    mockUseProSlots(activityId, month),
  useSlotMutations: () => ({
    updateSlot: mockUpdateSlot,
    updateSlotIsPending: false,
    updateSlotError: null,
    resetUpdateSlot: vi.fn(),
    deleteSlot: mockDeleteSlot,
    deleteSlotIsPending: false,
    deleteSlotError: null,
  }),
}));

/** Deux créneaux le 10 mars, un le 21, dans un mois fixe. */
const slots = [
  {
    id: 'slot-1',
    startAt: new Date(2027, 2, 10, 11, 0),
    durationMinutes: 90,
    maxParticipants: 8,
    remainingSeats: 8,
    priceEur: 85,
  },
  {
    id: 'slot-2',
    startAt: new Date(2027, 2, 10, 16, 0),
    durationMinutes: 90,
    maxParticipants: 8,
    remainingSeats: 0,
    priceEur: 85,
  },
  {
    id: 'slot-3',
    startAt: new Date(2027, 2, 21, 9, 0),
    durationMinutes: 90,
    maxParticipants: 8,
    remainingSeats: 4,
    priceEur: 85,
  },
];

const answer = (overrides: Record<string, unknown> = {}) => ({
  slots,
  availableMonths: ['2027-03'],
  slotsIsLoading: false,
  slotsError: null,
  ...overrides,
});

describe('SlotCalendar', () => {
  beforeEach(() => {
    // Le composant ouvre le mois courant : on fige la date à mars 2027.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2027, 2, 1));
    mockUseProSlots.mockReturnValue(answer());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('demande les créneaux du mois affiché', () => {
    render(<SlotCalendar activityId="activity-1" />);

    expect(mockUseProSlots).toHaveBeenCalledWith('activity-1', '2027-03');
  });

  it('présélectionne le premier jour occupé plutôt qu’un panneau vide', () => {
    render(<SlotCalendar activityId="activity-1" />);

    expect(screen.getByText(/mercredi 10 mars/i)).toBeTruthy();
    // Les deux créneaux du 10 sont affichés, celui du 21 non.
    expect(screen.getAllByText(/8 places|Complet/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/dimanche 21 mars/i)).toBeNull();
  });

  it('affiche les créneaux du jour choisi', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SlotCalendar activityId="activity-1" />);

    await user.click(screen.getByRole('button', { name: /21 mars/i }));

    expect(screen.getByText(/dimanche 21 mars/i)).toBeTruthy();
  });

  it('rend non cliquables les jours sans créneau', () => {
    render(<SlotCalendar activityId="activity-1" />);

    expect(screen.getByRole('button', { name: /12 mars/i })).toBeDisabled();
  });

  it('cadre le calendrier sur le mois imposé après une création', () => {
    render(
      <SlotCalendar
        activityId="activity-1"
        focusMonth={new Date(2027, 6, 1)}
      />,
    );

    // Sans ce recadrage, des créneaux créés en juillet resteraient invisibles
    // depuis le mois de mars affiché.
    expect(mockUseProSlots).toHaveBeenLastCalledWith('activity-1', '2027-07');
  });

  it('ouvre la confirmation avant de supprimer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SlotCalendar activityId="activity-1" />);

    await user.click(screen.getAllByRole('button', { name: /Actions/i })[0]);
    await user.click(screen.getByRole('menuitem', { name: /Supprimer/i }));

    expect(screen.getByText(/Supprimer ce créneau/i)).toBeTruthy();
    // Rien n'est supprime tant que la confirmation n'est pas validee.
    expect(mockDeleteSlot).not.toHaveBeenCalled();
  });

  it('supprime après confirmation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SlotCalendar activityId="activity-1" />);

    await user.click(screen.getAllByRole('button', { name: /Actions/i })[0]);
    await user.click(screen.getByRole('menuitem', { name: /Supprimer/i }));
    await user.click(screen.getByRole('button', { name: /^Supprimer$/i }));

    expect(mockDeleteSlot).toHaveBeenCalledWith(
      'slot-1',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('ouvre la modification depuis le menu', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SlotCalendar activityId="activity-1" />);

    await user.click(screen.getAllByRole('button', { name: /Actions/i })[0]);
    await user.click(screen.getByRole('menuitem', { name: /Modifier/i }));

    expect(screen.getByText(/Modifier le créneau/i)).toBeTruthy();
  });

  it('annonce un mois sans créneau', () => {
    mockUseProSlots.mockReturnValue(answer({ slots: [] }));

    render(<SlotCalendar activityId="activity-1" />);

    expect(screen.getByText(/Aucun créneau en mars 2027/i)).toBeTruthy();
  });

  it('affiche un état de chargement', () => {
    mockUseProSlots.mockReturnValue(
      answer({ slots: [], slotsIsLoading: true }),
    );

    render(<SlotCalendar activityId="activity-1" />);

    expect(screen.getByText(/Chargement des créneaux/i)).toBeTruthy();
  });

  it('rend une erreur de chargement lisible', () => {
    mockUseProSlots.mockReturnValue(
      answer({ slots: [], slotsError: new Error('Réseau indisponible') }),
    );

    render(<SlotCalendar activityId="activity-1" />);

    expect(screen.getByRole('alert')).toHaveTextContent(/Réseau indisponible/i);
  });
});
