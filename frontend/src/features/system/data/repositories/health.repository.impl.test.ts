import { describe, it, expect, vi, beforeEach } from 'vitest';
import HealthRepositoryImpl from './health.repository.impl';
import HealthApi from '../datasources/health.api';
import HealthMapper from '../mappers/health.mapper';
import type { HealthCheckResponseDto } from '../dtos/health.dto';

vi.mock('../datasources/health.api');

describe('HealthRepositoryImpl', () => {
  let api: HealthApi;
  let mapper: HealthMapper;
  let repository: HealthRepositoryImpl;

  const dto: HealthCheckResponseDto = {
    status: 'ok',
    version: '1.0.0',
    uptime: 1000,
    checks: { mongodb: 'ok', rabbitmq: 'ok', stripe: 'ok', sendgrid: 'ok' },
    responseTimeMs: 12,
  };

  beforeEach(() => {
    api = new HealthApi();
    mapper = new HealthMapper();
    repository = new HealthRepositoryImpl(api, mapper);
  });

  it('appelle api.getHealth puis mapper.toEntity', async () => {
    const apiSpy = vi.spyOn(api, 'getHealth').mockResolvedValue(dto);
    const mapperSpy = vi.spyOn(mapper, 'toEntity');

    const entity = await repository.getHealth();

    expect(apiSpy).toHaveBeenCalledOnce();
    expect(mapperSpy).toHaveBeenCalledWith(dto);
    expect(entity.status).toBe('ok');
    expect(entity.version).toBe('1.0.0');
  });

  it("propage les erreurs de l'API", async () => {
    vi.spyOn(api, 'getHealth').mockRejectedValue(new Error('boom'));

    await expect(repository.getHealth()).rejects.toThrow('boom');
  });

  it('peut être instancié avec les dépendances par défaut', () => {
    const repo = new HealthRepositoryImpl();
    expect(repo).toBeInstanceOf(HealthRepositoryImpl);
  });
});
