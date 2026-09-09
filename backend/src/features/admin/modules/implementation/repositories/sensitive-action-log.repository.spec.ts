import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SensitiveActionLogRepository } from './sensitive-action-log.repository';
import { SensitiveActionLogMapper } from '../mappers/sensitive-action-log.mapper';
import { SensitiveActionLogEntity } from '@features/admin/domains/entities/sensitive-action-log.entity';
import {
  AuditLogsQueryDto,
  CreateSensitiveActionLogDto,
} from '@features/admin/domains/dtos/sensitive-action-log.dto';

describe('SensitiveActionLogRepository', () => {
  let repository: SensitiveActionLogRepository;
  let logModel: jest.Mock & Record<string, jest.Mock>;
  let mapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;
  let findChain: {
    sort: jest.Mock;
    skip: jest.Mock;
    limit: jest.Mock;
    exec: jest.Mock;
  };

  const buildDto = (): CreateSensitiveActionLogDto => ({
    actorId: 'actor-1',
    actorRole: 'Admin',
    actionType: 'user.status_changed',
    targetType: 'User',
    targetId: 'target-1',
  });

  beforeEach(async () => {
    saveMock = jest.fn().mockResolvedValue({ _id: 'log-1' });
    logModel = jest.fn().mockImplementation((payload: unknown) => ({
      ...(payload as Record<string, unknown>),
      save: saveMock,
    })) as unknown as jest.Mock & Record<string, jest.Mock>;

    // find().sort().skip().limit().exec() : chaine fluide complete
    findChain = {
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
      exec: jest.fn().mockResolvedValue([{ _id: 'log-1' }, { _id: 'log-2' }]),
    };
    findChain.sort.mockReturnValue(findChain);
    findChain.skip.mockReturnValue(findChain);
    findChain.limit.mockReturnValue(findChain);

    logModel.find = jest.fn().mockReturnValue(findChain);
    logModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(2),
    });

    mapper = {
      toEntity: jest.fn(
        (doc: { _id: string }) =>
          new SensitiveActionLogEntity(doc._id as never),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensitiveActionLogRepository,
        { provide: getModelToken('SensitiveActionLog'), useValue: logModel },
        { provide: SensitiveActionLogMapper, useValue: mapper },
      ],
    }).compile();

    repository = module.get<SensitiveActionLogRepository>(
      SensitiveActionLogRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findWithFilters()', () => {
    it('should query with an empty filter and default pagination', async () => {
      const result = await repository.findWithFilters({} as AuditLogsQueryDto);

      expect(logModel.find).toHaveBeenCalledWith({});
      expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(findChain.skip).toHaveBeenCalledWith(0);
      expect(findChain.limit).toHaveBeenCalledWith(20);
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should compute the skip offset from page and pageSize', async () => {
      await repository.findWithFilters({
        page: 3,
        pageSize: 10,
      } as AuditLogsQueryDto);

      expect(findChain.skip).toHaveBeenCalledWith(20);
      expect(findChain.limit).toHaveBeenCalledWith(10);
    });

    it('should filter by actorId, actionType and severity', async () => {
      await repository.findWithFilters({
        actorId: 'actor-1',
        actionType: 'auth.login',
        severity: 'critical',
      } as AuditLogsQueryDto);

      expect(logModel.find).toHaveBeenCalledWith({
        actorId: 'actor-1',
        actionType: 'auth.login',
        severity: 'critical',
      });
    });

    it('should build a $gte createdAt filter from "from" only', async () => {
      await repository.findWithFilters({
        from: '2026-01-01T00:00:00.000Z',
      } as AuditLogsQueryDto);

      expect(logModel.find).toHaveBeenCalledWith({
        createdAt: { $gte: new Date('2026-01-01T00:00:00.000Z') },
      });
    });

    it('should build a $lte createdAt filter from "to" only', async () => {
      await repository.findWithFilters({
        to: '2026-12-31T00:00:00.000Z',
      } as AuditLogsQueryDto);

      expect(logModel.find).toHaveBeenCalledWith({
        createdAt: { $lte: new Date('2026-12-31T00:00:00.000Z') },
      });
    });

    it('should build a bounded createdAt filter from both dates', async () => {
      await repository.findWithFilters({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-12-31T00:00:00.000Z',
      } as AuditLogsQueryDto);

      expect(logModel.find).toHaveBeenCalledWith({
        createdAt: {
          $gte: new Date('2026-01-01T00:00:00.000Z'),
          $lte: new Date('2026-12-31T00:00:00.000Z'),
        },
      });
    });

    it('should use the same filter for the count query', async () => {
      await repository.findWithFilters({
        actorId: 'actor-1',
      } as AuditLogsQueryDto);

      expect(logModel.countDocuments).toHaveBeenCalledWith({
        actorId: 'actor-1',
      });
    });

    it('should return an empty page when nothing matches', async () => {
      findChain.exec.mockResolvedValue([]);
      logModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await repository.findWithFilters({} as AuditLogsQueryDto);

      expect(result).toEqual({ items: [], total: 0 });
    });

    it('should propagate a model failure', async () => {
      findChain.exec.mockRejectedValue(new Error('mongo down'));

      await expect(
        repository.findWithFilters({} as AuditLogsQueryDto),
      ).rejects.toThrow('mongo down');
    });
  });

  describe('create()', () => {
    it('should default the severity to "info" and attach an integrity hash', async () => {
      await repository.create(buildDto());

      const payload = logModel.mock.calls[0][0] as {
        severity: string;
        integrityHash: string;
        actorId: string;
      };
      expect(payload.severity).toBe('info');
      expect(payload.actorId).toBe('actor-1');
      expect(payload.integrityHash).toMatch(/^sha256-b64:/);
      expect(saveMock).toHaveBeenCalledTimes(1);
    });

    it('should keep the severity provided in the dto', async () => {
      await repository.create({ ...buildDto(), severity: 'critical' });

      const payload = logModel.mock.calls[0][0] as { severity: string };
      expect(payload.severity).toBe('critical');
    });

    it('should produce a base64 hash that decodes to the audited fields', async () => {
      await repository.create(buildDto());

      const payload = logModel.mock.calls[0][0] as { integrityHash: string };
      const base64 = payload.integrityHash.replace('sha256-b64:', '');
      const decoded = JSON.parse(
        Buffer.from(base64, 'base64').toString('utf8'),
      ) as Record<string, string>;

      expect(decoded.actorId).toBe('actor-1');
      expect(decoded.actionType).toBe('user.status_changed');
      expect(decoded.targetId).toBe('target-1');
      expect(decoded.timestamp).toBeDefined();
    });

    it('should map the saved document', async () => {
      const result = await repository.create(buildDto());

      expect(mapper.toEntity).toHaveBeenCalledWith({ _id: 'log-1' });
      expect(result.getId()).toBe('log-1');
    });

    it('should propagate a save failure', async () => {
      saveMock.mockRejectedValue(new Error('write concern error'));

      await expect(repository.create(buildDto())).rejects.toThrow(
        'write concern error',
      );
    });
  });
});
