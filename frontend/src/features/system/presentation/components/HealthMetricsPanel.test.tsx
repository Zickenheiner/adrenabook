import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthMetricsPanel from './HealthMetricsPanel';
import type { HealthEntity } from '../../domain/entities/health.entity';

function buildHealth(overrides: Partial<HealthEntity> = {}): HealthEntity {
  return {
    status: 'ok',
    version: '1.2.3',
    uptime: 0,
    checks: { mongodb: 'ok', rabbitmq: 'ok', stripe: 'ok', sendgrid: 'ok' },
    responseTimeMs: 50,
    checkedAt: new Date('2026-05-11T08:15:00.000Z'),
    ...overrides,
  };
}

describe('HealthMetricsPanel', () => {
  it('affiche la version', () => {
    render(<HealthMetricsPanel health={buildHealth({ version: '4.5.6' })} />);
    expect(screen.getByText('4.5.6')).toBeInTheDocument();
  });

  it('formate uptime avec jours, heures et minutes', () => {
    const uptime = 2 * 86400 + 3 * 3600 + 4 * 60;
    render(<HealthMetricsPanel health={buildHealth({ uptime })} />);
    expect(screen.getByText('2j 3h 4min')).toBeInTheDocument();
  });

  it('formate un uptime court (<1 minute) en 0min', () => {
    render(<HealthMetricsPanel health={buildHealth({ uptime: 30 })} />);
    expect(screen.getByText('0min')).toBeInTheDocument();
  });

  it('classe une réponse < 100 ms comme "Excellent"', () => {
    render(<HealthMetricsPanel health={buildHealth({ responseTimeMs: 50 })} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('classe une réponse entre 100 et 300 ms comme "Bon"', () => {
    render(
      <HealthMetricsPanel health={buildHealth({ responseTimeMs: 200 })} />,
    );
    expect(screen.getByText('Bon')).toBeInTheDocument();
  });

  it('classe une réponse entre 300 et 800 ms comme "Acceptable"', () => {
    render(
      <HealthMetricsPanel health={buildHealth({ responseTimeMs: 500 })} />,
    );
    expect(screen.getByText('Acceptable')).toBeInTheDocument();
  });

  it('classe une réponse > 800 ms comme "Lent"', () => {
    render(
      <HealthMetricsPanel health={buildHealth({ responseTimeMs: 1200 })} />,
    );
    expect(screen.getByText('Lent')).toBeInTheDocument();
  });

  it('affiche le temps de réponse en ms', () => {
    render(<HealthMetricsPanel health={buildHealth({ responseTimeMs: 73 })} />);
    expect(screen.getByText('73 ms')).toBeInTheDocument();
  });

  it('affiche un tiret quand version est vide', () => {
    render(<HealthMetricsPanel health={buildHealth({ version: '' })} />);
    const versionLabel = screen.getByText('Version').parentElement;
    expect(versionLabel?.textContent).toContain('—');
  });
});
