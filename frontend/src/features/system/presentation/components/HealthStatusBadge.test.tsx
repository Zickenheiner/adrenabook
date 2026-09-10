import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthStatusBadge from './HealthStatusBadge';

describe('HealthStatusBadge', () => {
  it('affiche "Opérationnel" pour le statut ok', () => {
    render(<HealthStatusBadge status="ok" />);
    expect(screen.getByText('Opérationnel')).toBeInTheDocument();
  });

  it('affiche "Dégradé" pour le statut degraded', () => {
    render(<HealthStatusBadge status="degraded" />);
    expect(screen.getByText('Dégradé')).toBeInTheDocument();
  });

  it('affiche "Indisponible" pour le statut down', () => {
    render(<HealthStatusBadge status="down" />);
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
  });

  it('applique la className fournie', () => {
    const { container } = render(
      <HealthStatusBadge status="ok" className="extra-class" />,
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('extra-class');
  });
});
