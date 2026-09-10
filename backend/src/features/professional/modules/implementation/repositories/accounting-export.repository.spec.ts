import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AccountingExportRepository } from './accounting-export.repository';
import { AccountingExportMapper } from '../mappers/accounting-export.mapper';
import { AccountingExportEntity } from '@features/professional/domains/entities/accounting-export.entity';
import {
  AccountingExportDeliveryMode,
  AccountingExportFormat,
  CreateAccountingExportDto,
} from '@features/professional/domains/dtos/accounting-export.dto';

// Fabrique un maillon de chaine Mongoose terminee par exec()
const chain = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

const PROFESSIONAL_ID = '68b4d59919d9b7a94b4fde10';

describe('AccountingExportRepository', () => {
  let repository: AccountingExportRepository;
  let exportModel: jest.Mock & Record<string, jest.Mock>;
  let mapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const dto: CreateAccountingExportDto = {
    format: AccountingExportFormat.SAGE50,
    from: '2026-01-01',
    to: '2026-03-31',
    includeRefunds: true,
    deliveryMode: AccountingExportDeliveryMode.DOWNLOAD,
  };

  beforeEach(async () => {
    saveMock = jest.fn().mockResolvedValue({ _id: 'export-1' });
    exportModel = jest.fn().mockImplementation((payload: unknown) => ({
      ...(payload as Record<string, unknown>),
      save: saveMock,
    })) as unknown as jest.Mock & Record<string, jest.Mock>;

    exportModel.findById = jest.fn();

    mapper = {
      toEntity: jest.fn(
        (doc: { _id: string }) => new AccountingExportEntity(doc._id as never),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingExportRepository,
        { provide: getModelToken('AccountingExport'), useValue: exportModel },
        { provide: AccountingExportMapper, useValue: mapper },
      ],
    }).compile();

    repository = module.get<AccountingExportRepository>(
      AccountingExportRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create()', () => {
    it('should persist the export job and map the saved document', async () => {
      const result = await repository.create(dto, PROFESSIONAL_ID);

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(mapper.toEntity).toHaveBeenCalledWith({ _id: 'export-1' });
      expect(result.getId()).toBe('export-1');
    });

    it('should convert the date range into Date instances', async () => {
      await repository.create(dto, PROFESSIONAL_ID);

      const payload = exportModel.mock.calls[0][0] as {
        from: Date;
        to: Date;
      };
      expect(payload.from).toBeInstanceOf(Date);
      expect(payload.to).toBeInstanceOf(Date);
      expect(payload.from.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(payload.to.toISOString()).toBe('2026-03-31T00:00:00.000Z');
    });

    it('should store the professional id as an object id', async () => {
      await repository.create(dto, PROFESSIONAL_ID);

      const payload = exportModel.mock.calls[0][0] as {
        professionalId: Types.ObjectId;
      };
      expect(payload.professionalId).toBeInstanceOf(Types.ObjectId);
      expect(payload.professionalId.toString()).toBe(PROFESSIONAL_ID);
    });

    it('should initialise the job as queued with no record yet', async () => {
      await repository.create(dto, PROFESSIONAL_ID);

      const payload = exportModel.mock.calls[0][0] as {
        format: string;
        includeRefunds: boolean;
        deliveryMode: string;
        status: string;
        recordsCount: number;
      };
      expect(payload.format).toBe(AccountingExportFormat.SAGE50);
      expect(payload.includeRefunds).toBe(true);
      expect(payload.deliveryMode).toBe(AccountingExportDeliveryMode.DOWNLOAD);
      expect(payload.status).toBe('queued');
      expect(payload.recordsCount).toBe(0);
    });

    it('should reject when the professional id is not a valid object id', async () => {
      await expect(repository.create(dto, 'not-an-id')).rejects.toThrow();
      expect(saveMock).not.toHaveBeenCalled();
    });

    it('should propagate a save failure', async () => {
      saveMock.mockRejectedValue(new Error('write concern error'));

      await expect(repository.create(dto, PROFESSIONAL_ID)).rejects.toThrow(
        'write concern error',
      );
    });
  });

  describe('findById()', () => {
    it('should map the found export job', async () => {
      exportModel.findById.mockReturnValue(chain({ _id: 'export-1' }));

      const result = await repository.findById('export-1');

      expect(exportModel.findById).toHaveBeenCalledWith('export-1');
      expect(result?.getId()).toBe('export-1');
    });

    it('should return null when the export job does not exist', async () => {
      exportModel.findById.mockReturnValue(chain(null));

      await expect(repository.findById('unknown')).resolves.toBeNull();
      expect(mapper.toEntity).not.toHaveBeenCalled();
    });

    it('should propagate a query failure', async () => {
      exportModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('connection lost')),
      });

      await expect(repository.findById('export-1')).rejects.toThrow(
        'connection lost',
      );
    });
  });
});
