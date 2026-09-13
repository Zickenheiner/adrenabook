import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfessionalRegistrationForm from './ProfessionalRegistrationForm';

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never;

const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProfessionalRegistrationForm onSubmit={() => {}} />
    </QueryClientProvider>,
  );

const set = (placeholder: string, value: string) =>
  fireEvent.change(screen.getByPlaceholderText(placeholder), {
    target: { value },
  });

/** Amene le formulaire jusqu'a la derniere etape, celle des documents. */
const goToDocuments = async () => {
  set('Alpes Aventures SARL', 'Alpes SARL');
  set('73282932000074', '73282932000074');
  set('contact@centre.fr', 'contact@alpes.fr');
  set('+33450000000', '+33450123456');
  fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

  await waitFor(() =>
    expect(screen.getByPlaceholderText('12 rue des Alpes')).toBeTruthy(),
  );
  set('12 rue des Alpes', '12 rue des Alpes');
  set('74400', '74400');
  set('Chamonix', 'Chamonix');
  fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

  return screen.findByRole('button', { name: /Soumettre le dossier/i });
};

const redFields = () => document.querySelectorAll('.border-destructive').length;

describe('ProfessionalRegistrationForm', () => {
  it('reaches the documents step without reporting anything', async () => {
    renderForm();

    await goToDocuments();

    // Le dossier ne doit pas etre refuse avant d'avoir ete tente.
    expect(screen.queryByText(/Formulaire incomplet/i)).toBeNull();
    expect(redFields()).toBe(0);
  });

  it('flags both required documents once the dossier is submitted empty', async () => {
    renderForm();
    const submit = await goToDocuments();

    fireEvent.click(submit);

    await waitFor(() =>
      expect(screen.getByText(/Formulaire incomplet/i)).toBeTruthy(),
    );
    // Le Kbis et la RC Pro, les deux pieces obligatoires.
    expect(redFields()).toBe(2);
  });

  it('does not submit the dossier from the Suivant button', async () => {
    const onSubmit = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ProfessionalRegistrationForm onSubmit={onSubmit} />
      </QueryClientProvider>,
    );

    await goToDocuments();

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
