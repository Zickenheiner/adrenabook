import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import DocumentUploadField from './DocumentUploadField';

// Le champ televerse via un hook React Query.
const wrap = (ui: ReactNode) =>
  render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );

describe('DocumentUploadField', () => {
  const base = {
    label: 'Extrait Kbis — obligatoire',
    value: '',
    onChange: () => {},
  };

  it('stays neutral while no error is passed', () => {
    wrap(<DocumentUploadField {...base} />);

    expect(screen.queryByText(/obligatoire\./i)).toBeNull();
    expect(document.querySelector('.border-destructive')).toBeNull();
  });

  it('shows the error it is given', () => {
    wrap(<DocumentUploadField {...base} error="Le Kbis est obligatoire." />);

    expect(screen.getByText('Le Kbis est obligatoire.')).toBeTruthy();
    expect(document.querySelector('.border-destructive')).not.toBeNull();
  });
});
