import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { getHealthMock } = vi.hoisted(() => ({
  getHealthMock: vi.fn(),
}));

vi.mock('../../data/repositories/health.repository.impl', () => ({
  default: class {
    getHealth = getHealthMock;
  },
}));

import { useHealth } from './health.hook';
import type { HealthEntity } from '../entities/health.entity';

function buildEntity(overrides: Partial<HealthEntity> = {}): HealthEntity {
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

function buildWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe('useHealth', () => {
  beforeEach(() => {
    getHealthMock.mockReset();
  });

  it("retourne loading puis les données quand l'appel réussit", async () => {
    const entity = buildEntity();
    getHealthMock.mockResolvedValueOnce(entity);

    const { result } = renderHook(() => useHealth(), {
      wrapper: buildWrapper(),
    });

    expect(result.current.healthIsLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.healthIsLoading).toBe(false);
    });

    expect(result.current.health).toEqual(entity);
    expect(result.current.healthError).toBeNull();
    expect(result.current.healthUpdatedAt).toBeInstanceOf(Date);
  });

  it("expose l'erreur quand l'appel échoue", async () => {
    getHealthMock.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useHealth(), {
      wrapper: buildWrapper(),
    });

    // Le hook a retry: 1 → on attend assez longtemps pour que les 2 essais
    // (initial + retry) échouent et que l'erreur soit exposée.
    await waitFor(
      () => {
        expect(result.current.healthError).toBeTruthy();
      },
      { timeout: 5000 },
    );

    expect(result.current.health).toBeUndefined();
  });

  it('fournit une fonction healthRefetch', async () => {
    getHealthMock.mockResolvedValue(buildEntity());

    const { result } = renderHook(() => useHealth(), {
      wrapper: buildWrapper(),
    });

    await waitFor(() => expect(result.current.healthIsLoading).toBe(false));

    expect(typeof result.current.healthRefetch).toBe('function');
  });
});
