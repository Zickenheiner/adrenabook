import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import HealthMapper from './health.mapper';
import type { HealthCheckResponseDto } from '../dtos/health.dto';

describe('HealthMapper', () => {
  let mapper: HealthMapper;

  beforeEach(() => {
    mapper = new HealthMapper();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-11T10:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseDto: HealthCheckResponseDto = {
    status: 'ok',
    version: '1.2.3',
    uptime: 12345,
    checks: {
      mongodb: 'ok',
      rabbitmq: 'ok',
      stripe: 'ok',
      sendgrid: 'ok',
    },
    responseTimeMs: 42,
  };

  it('transforme un DTO en HealthEntity', () => {
    const entity = mapper.toEntity(baseDto);

    expect(entity).toEqual({
      status: 'ok',
      version: '1.2.3',
      uptime: 12345,
      checks: {
        mongodb: 'ok',
        rabbitmq: 'ok',
        stripe: 'ok',
        sendgrid: 'ok',
      },
      responseTimeMs: 42,
      checkedAt: new Date('2026-05-11T10:30:00.000Z'),
    });
  });

  it("affecte un checkedAt = Date.now() au moment de l'appel", () => {
    const entity = mapper.toEntity(baseDto);
    expect(entity.checkedAt).toBeInstanceOf(Date);
    expect(entity.checkedAt.toISOString()).toBe('2026-05-11T10:30:00.000Z');
  });

  it('préserve les états dégradés', () => {
    const entity = mapper.toEntity({
      ...baseDto,
      status: 'degraded',
      checks: { ...baseDto.checks, stripe: 'fail' },
    });
    expect(entity.status).toBe('degraded');
    expect(entity.checks.stripe).toBe('fail');
  });

  it('préserve les états down', () => {
    const entity = mapper.toEntity({ ...baseDto, status: 'down' });
    expect(entity.status).toBe('down');
  });
});
