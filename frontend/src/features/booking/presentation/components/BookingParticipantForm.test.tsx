import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import BookingParticipantForm from './BookingParticipantForm';
import type { CreateBookingFormData } from '../../domain/schemas/booking.schema';

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never;

const account = {
  id: 'user-1',
  email: 'lou@example.com',
  firstName: 'Lou',
  lastName: 'Martin',
  birthDate: '1990-04-12',
};

const mockAccount = vi.fn(() => ({
  account,
  accountIsLoading: false,
  accountError: null,
}));

vi.mock('@/features/account/domain/hooks/account.hook', () => ({
  useCurrentAccount: () => mockAccount(),
}));

function Harness({ canBeSelf = true }: { canBeSelf?: boolean }) {
  const form = useForm<CreateBookingFormData>({
    defaultValues: {
      slotId: 'slot-1',
      participants: [{ firstName: '', lastName: '', birthDate: '' }],
      acceptCenterTerms: false,
    },
  });

  return (
    <FormProvider {...form}>
      <BookingParticipantForm
        index={0}
        canRemove={false}
        canBeSelf={canBeSelf}
      />
    </FormProvider>
  );
}

const field = (label: RegExp) =>
  screen.getByLabelText(label) as HTMLInputElement;

describe("BookingParticipantForm — « C'est moi »", () => {
  beforeEach(() => {
    mockAccount.mockReturnValue({
      account,
      accountIsLoading: false,
      accountError: null,
    });
  });

  it("pré-remplit l'état civil du titulaire quand la case est cochée", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText(/C'est moi/i));

    expect(field(/Prénom/i).value).toBe('Lou');
    expect(field(/^Nom$/i).value).toBe('Martin');
    expect(field(/Date de naissance/i).value).toBe('1990-04-12');
  });

  it('vide les champs quand la case est décochée', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const checkbox = screen.getByLabelText(/C'est moi/i);
    await user.click(checkbox);
    await user.click(checkbox);

    expect(field(/Prénom/i).value).toBe('');
    expect(field(/^Nom$/i).value).toBe('');
    expect(field(/Date de naissance/i).value).toBe('');
  });

  it("n'offre la case qu'au premier participant", () => {
    render(<Harness canBeSelf={false} />);

    expect(screen.queryByLabelText(/C'est moi/i)).toBeNull();
  });

  it("n'offre pas la case tant que le compte n'est pas chargé", () => {
    mockAccount.mockReturnValue({
      account: undefined,
      accountIsLoading: true,
      accountError: null,
    } as never);

    render(<Harness />);

    expect(screen.queryByLabelText(/C'est moi/i)).toBeNull();
  });
});
