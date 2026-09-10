import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { AuditLog } from '@features/admin/domains/schemas/audit-log.schema';
import {
  CreateAuditLogDto,
  UpdateAuditLogDto,
} from '@features/admin/domains/dtos/audit-log.dto';

/**
 * Query Mongoose chainable : exec() resout la valeur finale.
 */
interface ChainableQuery {
  exec: jest.Mock;
}

const mockQuery = (result: unknown): ChainableQuery => ({
  exec: jest.fn().mockResolvedValue(result),
});

interface AuditLogModelMock extends jest.Mock {
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
}

describe('AuditLogRepository', () => {
  let repository: AuditLogRepository;
  let auditLogModel: AuditLogModelMock;
  let auditLogMapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const createDto: CreateAuditLogDto = {
    targetUserId: '68b4d59919d9b7a94b4fde21',
    adminId: '68b4d59919d9b7a94b4fde22',
    previousStatus: 'active',
    newStatus: 'suspended',
    reason: 'Multiple violations of terms of service',
    durationDays: 7,
    effectiveUntil: new Date('2026-08-27T00:00:00.000Z'),
  };

  beforeEach(async () => {
    saveMock = jest.fn();

    auditLogModel = jest.fn().mockImplementation((data: unknown) => ({
      ...(data as Record<string, unknown>),
      save: saveMock,
    })) as unknown as AuditLogModelMock;

    auditLogModel.find = jest.fn();
    auditLogModel.findById = jest.fn();
    auditLogModel.findByIdAndUpdate = jest.fn();
    auditLogModel.findByIdAndDelete = jest.fn();

    auditLogMapper = {
      toEntity: jest.fn((doc: { _id: unknown }) => ({
        entityFor: String(doc._id),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogRepository,
        { provide: getModelToken(AuditLog.name), useValue: auditLogModel },
        { provide: AuditLogMapper, useValue: auditLogMapper },
      ],
    }).compile();

    repository = module.get<AuditLogRepository>(AuditLogRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    it('should map every document to an entity', async () => {
      auditLogModel.find.mockReturnValue(
        mockQuery([{ _id: 'a1' }, { _id: 'a2' }]),
      );

      const result = await repository.findAll();

      expect(auditLogModel.find).toHaveBeenCalledWith();
      expect(result).toEqual([{ entityFor: 'a1' }, { entityFor: 'a2' }]);
    });

    it('should return an empty array when no audit log exists', async () => {
      auditLogModel.find.mockReturnValue(mockQuery([]));

      expect(await repository.findAll()).toEqual([]);
      expect(auditLogMapper.toEntity).not.toHaveBeenCalled();
    });

    it('should return null when the query resolves to null', async () => {
      auditLogModel.find.mockReturnValue(mockQuery(null));

      expect(await repository.findAll()).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should map the found document', async () => {
      auditLogModel.findById.mockReturnValue(mockQuery({ _id: 'a1' }));

      const result = await repository.findById('a1');

      expect(auditLogModel.findById).toHaveBeenCalledWith('a1');
      expect(result).toEqual({ entityFor: 'a1' });
    });

    it('should return null when the audit log does not exist', async () => {
      auditLogModel.findById.mockReturnValue(mockQuery(null));

      expect(await repository.findById('missing')).toBeNull();
      expect(auditLogMapper.toEntity).not.toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('should build the document from the dto and map the saved entity', async () => {
      saveMock.mockResolvedValue({ _id: 'created' });

      const result = await repository.create(createDto);

      expect(auditLogModel).toHaveBeenCalledWith(createDto);
      expect(auditLogMapper.toEntity).toHaveBeenCalledWith({ _id: 'created' });
      expect(result).toEqual({ entityFor: 'created' });
    });

    it('should map even when the save resolves to nothing', async () => {
      saveMock.mockResolvedValue(null);
      auditLogMapper.toEntity.mockReturnValue({ entityFor: 'null-doc' });

      const result = await repository.create(createDto);

      expect(auditLogMapper.toEntity).toHaveBeenCalledWith(null);
      expect(result).toEqual({ entityFor: 'null-doc' });
    });

    it('should propagate a save rejection', async () => {
      saveMock.mockRejectedValue(new Error('duplicate key'));

      await expect(repository.create(createDto)).rejects.toThrow(
        'duplicate key',
      );
    });
  });

  describe('update()', () => {
    it('should return true when the audit log was updated', async () => {
      auditLogModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'a1' }));

      const dto: UpdateAuditLogDto = { reason: 'Updated reason' };
      const result = await repository.update('a1', dto);

      expect(auditLogModel.findByIdAndUpdate).toHaveBeenCalledWith('a1', dto, {
        new: true,
      });
      expect(result).toBe(true);
    });

    it('should return false when no audit log matched', async () => {
      auditLogModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

      expect(await repository.update('missing', {})).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should return true when the audit log was deleted', async () => {
      auditLogModel.findByIdAndDelete.mockReturnValue(mockQuery({ _id: 'a1' }));

      expect(await repository.delete('a1')).toBe(true);
      expect(auditLogModel.findByIdAndDelete).toHaveBeenCalledWith('a1');
    });

    it('should return false when no audit log matched', async () => {
      auditLogModel.findByIdAndDelete.mockReturnValue(mockQuery(null));

      expect(await repository.delete('missing')).toBe(false);
    });
  });
});
