import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';

const { useHealthMock } = vi.hoisted(() => ({
  useHealthMock: vi.fn(),
}));

vi.mock('../../domain/hooks/health.hook', () => ({
  useHealth: () => useHealthMock(),
}));

import SystemHealthPage from './SystemHealthPage';
import type { HealthEntity } from '../../domain/entities/health.entity';

function buildHealth(overrides: Partial<HealthEntity> = {}): HealthEntity {
  return {
    status: 'ok',
    version: '1.0.0',
    uptime: 100,
    checks: { mongodb: 'ok', rabbitmq: 'ok', stripe: 'ok', sendgrid: 'ok' },
    responseTimeMs: 50,
    checkedAt: new Date('2026-05-11T09:00:00.000Z'),
    ...overrides,
  };
}

describe('SystemHealthPage', () => {
  beforeEach(() => {
    useHealthMock.mockReset();
  });

  it('affiche le skeleton pendant le chargement', () => {
    useHealthMock.mockReturnValue({
      health: undefined,
      healthIsLoading: true,
      healthIsRefetching: false,
      healthError: null,
      healthRefetch: vi.fn(),
      healthUpdatedAt: undefined,
    });

    const { container } = renderWithProviders(<SystemHealthPage />);
    // Le skeleton contient des éléments div sans texte "Santé du système"
    expect(screen.queryByText('Santé du système')).not.toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("affiche l'état d'erreur quand health=undefined et error présent", async () => {
    useHealthMock.mockReturnValue({
      health: undefined,
      healthIsLoading: false,
      healthIsRefetching: false,
      healthError: new Error('network'),
      healthRefetch: vi.fn(),
      healthUpdatedAt: undefined,
    });

    renderWithProviders(<SystemHealthPage />);
    await waitFor(() => {
      expect(screen.getByText('Service indisponible')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /Réessayer/i }),
    ).toBeInTheDocument();
  });

  it("affiche l'état vide quand aucune donnée n'est disponible", async () => {
    useHealthMock.mockReturnValue({
      health: undefined,
      healthIsLoading: false,
      healthIsRefetching: false,
      healthError: null,
      healthRefetch: vi.fn(),
      healthUpdatedAt: undefined,
    });

    renderWithProviders(<SystemHealthPage />);
    await waitFor(() => {
      expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument();
    });
  });

  it('affiche le tableau de bord complet quand health est présent', async () => {
    useHealthMock.mockReturnValue({
      health: buildHealth(),
      healthIsLoading: false,
      healthIsRefetching: false,
      healthError: null,
      healthRefetch: vi.fn(),
      healthUpdatedAt: new Date('2026-05-11T09:00:00.000Z'),
    });

    renderWithProviders(<SystemHealthPage />);

    expect(screen.getByText('Santé du système')).toBeInTheDocument();
    expect(screen.getByText('Statut global')).toBeInTheDocument();
    expect(screen.getByText('Métriques système')).toBeInTheDocument();
    expect(screen.getByText('Dépendances surveillées')).toBeInTheDocument();
  });

  it('appelle healthRefetch quand on clique sur Rafraîchir', async () => {
    const refetch = vi.fn();
    useHealthMock.mockReturnValue({
      health: buildHealth(),
      healthIsLoading: false,
      healthIsRefetching: false,
      healthError: null,
      healthRefetch: refetch,
      healthUpdatedAt: new Date('2026-05-11T09:00:00.000Z'),
    });

    renderWithProviders(<SystemHealthPage />);

    const button = screen.getByRole('button', { name: /Rafraîchir/i });
    button.click();
    expect(refetch).toHaveBeenCalled();
  });
});
