import { render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { Toaster } from './sonner';

describe('Toaster', () => {
  it('colore les toasts par type via les tokens du projet', async () => {
    render(<Toaster />);
    toast.success('Créneau créé');

    const item = await waitFor(() =>
      screen.getByText('Créneau créé').closest('[data-sonner-toast]'),
    );

    // Sans richColors, sonner rendrait tous les toasts avec --normal-*.
    expect(item?.getAttribute('data-rich-colors')).toBe('true');
    expect(item?.getAttribute('data-type')).toBe('success');

    const style = item?.closest('[data-sonner-toaster]')?.getAttribute('style');
    expect(style).toContain('--success-text: var(--success-strong)');
    expect(style).toContain('--success-border: var(--success-strong)');
    expect(style).toContain('--error-text: var(--destructive-strong)');
    expect(style).toContain('--error-border: var(--destructive-strong)');
  });
});
