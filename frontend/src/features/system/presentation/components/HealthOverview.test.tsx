import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthOverview from './HealthOverview';
import type { HealthEntity } from '../../domain/entities/health.entity';

function buildHealth(overrides: Partial<HealthEntity> = {}): HealthEntity {
  return {
    status: 'ok',
    version: '1.0.0',
    uptime: 100,
    checks: { mongodb: 'ok', rabbitmq: 'ok', stripe: 'ok', sendgrid: 'ok' },
    responseTimeMs: 80,
    checkedAt: new Date('2026-05-11T10:00:00.000Z'),
    ...overrides,
  };
}

describe('HealthOverview', () => {
  it('affiche le titre et le message OK', () => {
    render(<HealthOverview health={buildHealth()} />);
    expect(screen.getByText('Statut global')).toBeInTheDocument();
    expect(
      screen.getByText('Tous les services répondent normalement.'),
    ).toBeInTheDocument();
  });

  it('liste les services en échec quand degraded', () => {
    render(
      <HealthOverview
        health={buildHealth({
          status: 'degraded',
          checks: {
            mongodb: 'ok',
            rabbitmq: 'fail',
            stripe: 'fail',
            sendgrid: 'ok',
          },
        })}
      />,
    );
    expect(screen.getByText(/Services en échec/)).toBeInTheDocument();
    expect(screen.getByText(/rabbitmq, stripe/)).toBeInTheDocument();
  });

  it('affiche le message down quand le service est indisponible', () => {
    render(<HealthOverview health={buildHealth({ status: 'down' })} />);
    expect(
      screen.getByText(
        /Le service est indisponible. Les sondes Kubernetes retourneront 503./,
      ),
    ).toBeInTheDocument();
  });

  it("n'affiche pas de liste d'échec quand tous les checks sont ok", () => {
    render(<HealthOverview health={buildHealth()} />);
    expect(screen.queryByText(/Services en échec/)).not.toBeInTheDocument();
  });
});
