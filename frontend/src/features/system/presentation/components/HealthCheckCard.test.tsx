import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthCheckCard from './HealthCheckCard';

describe('HealthCheckCard', () => {
  it('affiche le label et la description du check', () => {
    render(<HealthCheckCard name="mongodb" state="ok" />);
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
    expect(screen.getByText('Base de données principale')).toBeInTheDocument();
  });

  it('affiche "Connexion saine" quand state=ok', () => {
    render(<HealthCheckCard name="mongodb" state="ok" />);
    expect(screen.getByText('Connexion saine')).toBeInTheDocument();
    expect(screen.getByLabelText('ok')).toBeInTheDocument();
  });

  it('affiche "Indisponible" quand state=fail', () => {
    render(<HealthCheckCard name="stripe" state="fail" />);
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
    expect(screen.getByLabelText('échec')).toBeInTheDocument();
  });

  it('rend toutes les variantes connues sans erreur', () => {
    const names = ['mongodb', 'stripe', 'sendgrid'] as const;
    names.forEach((name) => {
      const { unmount } = render(<HealthCheckCard name={name} state="ok" />);
      unmount();
    });
  });
});
