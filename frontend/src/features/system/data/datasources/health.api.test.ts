import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}));

vi.mock('@/core/config/api', () => ({
  default: requestMock,
}));

import HealthApi from './health.api';

describe('HealthApi', () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('appelle GET /health par défaut', async () => {
    requestMock.mockResolvedValue({
      status: 'ok',
      version: '1.0.0',
      uptime: 0,
      checks: { mongodb: 'ok', rabbitmq: 'ok', stripe: 'ok', sendgrid: 'ok' },
      responseTimeMs: 5,
    });
    const api = new HealthApi();

    await api.getHealth();

    expect(requestMock).toHaveBeenCalledWith({
      url: '/health',
      method: 'GET',
    });
  });

  it('utilise la baseUrl fournie en paramètre', async () => {
    requestMock.mockResolvedValue({
      status: 'ok',
      version: '1.0.0',
      uptime: 0,
      checks: { mongodb: 'ok', rabbitmq: 'ok', stripe: 'ok', sendgrid: 'ok' },
      responseTimeMs: 5,
    });
    const api = new HealthApi('/custom-health');

    await api.getHealth();

    expect(requestMock).toHaveBeenCalledWith({
      url: '/custom-health',
      method: 'GET',
    });
  });

  it('retourne directement la réponse', async () => {
    const expected = {
      status: 'degraded' as const,
      version: '2.0.0',
      uptime: 99,
      checks: {
        mongodb: 'ok' as const,
        rabbitmq: 'fail' as const,
        stripe: 'ok' as const,
        sendgrid: 'ok' as const,
      },
      responseTimeMs: 130,
    };
    requestMock.mockResolvedValue(expected);
    const api = new HealthApi();

    await expect(api.getHealth()).resolves.toEqual(expected);
  });
});
