import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CsvImportRepository } from './csv-import.repository';
import { CsvImportMapper } from '../mappers/csv-import.mapper';
import { CsvImportEntity } from '@features/professional/domains/entities/csv-import.entity';
import { CsvImportDto } from '@features/professional/domains/dtos/csv-import.dto';

// Fabrique un maillon de chaine Mongoose terminee par exec()
const chain = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

const PROFESSIONAL_ID = '68b4d59919d9b7a94b4fde10';

describe('CsvImportRepository', () => {
  let repository: CsvImportRepository;
  let csvImportModel: jest.Mock & Record<string, jest.Mock>;
  let mapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const dto: CsvImportDto = {
    entityType: 'slots',
    fileId: 'file_abc123',
    columnMapping: { date: 'startDate', title: 'name' },
    dryRun: true,
  };

  beforeEach(async () => {
    saveMock = jest.fn().mockResolvedValue({ _id: 'import-1' });
    csvImportModel = jest.fn().mockImplementation((payload: unknown) => ({
      ...(payload as Record<string, unknown>),
      save: saveMock,
    })) as unknown as jest.Mock & Record<string, jest.Mock>;

    csvImportModel.findById = jest.fn();

    mapper = {
      toEntity: jest.fn(
        (doc: { _id: string }) => new CsvImportEntity(doc._id as never),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvImportRepository,
        { provide: getModelToken('CsvImport'), useValue: csvImportModel },
        { provide: CsvImportMapper, useValue: mapper },
      ],
    }).compile();

    repository = module.get<CsvImportRepository>(CsvImportRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create()', () => {
    it('should persist the import job and map the saved document', async () => {
      const result = await repository.create(dto, PROFESSIONAL_ID);

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(mapper.toEntity).toHaveBeenCalledWith({ _id: 'import-1' });
      expect(result?.getId()).toBe('import-1');
    });

    it('should build the payload from the dto and the professional id', async () => {
      await repository.create(dto, PROFESSIONAL_ID);

      const payload = csvImportModel.mock.calls[0][0] as {
        entityType: string;
        fileId: string;
        columnMapping: Record<string, string>;
        dryRun: boolean;
        professionalId: string;
      };
      expect(payload.entityType).toBe('slots');
      expect(payload.fileId).toBe('file_abc123');
      expect(payload.columnMapping).toEqual({
        date: 'startDate',
        title: 'name',
      });
      expect(payload.dryRun).toBe(true);
      expect(payload.professionalId).toBe(PROFESSIONAL_ID);
    });

    it('should initialise the counters and the queued status', async () => {
      await repository.create(dto, PROFESSIONAL_ID);

      const payload = csvImportModel.mock.calls[0][0] as {
        status: string;
        rowsTotal: number;
        rowsSuccess: number;
        rowsErrors: number;
        errors: unknown[];
      };
      expect(payload.status).toBe('queued');
      expect(payload.rowsTotal).toBe(0);
      expect(payload.rowsSuccess).toBe(0);
      expect(payload.rowsErrors).toBe(0);
      expect(payload.errors).toEqual([]);
    });

    it('should accept the other entity types', async () => {
      await repository.create({ ...dto, entityType: 'customers' }, 'pro-1');

      const payload = csvImportModel.mock.calls[0][0] as {
        entityType: string;
      };
      expect(payload.entityType).toBe('customers');
    });

    it('should return null when the save resolves to a falsy document', async () => {
      saveMock.mockResolvedValue(null);

      await expect(repository.create(dto, PROFESSIONAL_ID)).resolves.toBeNull();
      expect(mapper.toEntity).not.toHaveBeenCalled();
    });

    it('should propagate a save failure', async () => {
      saveMock.mockRejectedValue(new Error('validation failed'));

      await expect(repository.create(dto, PROFESSIONAL_ID)).rejects.toThrow(
        'validation failed',
      );
    });
  });

  describe('findById()', () => {
    it('should map the found import job', async () => {
      csvImportModel.findById.mockReturnValue(chain({ _id: 'import-1' }));

      const result = await repository.findById('import-1');

      expect(csvImportModel.findById).toHaveBeenCalledWith('import-1');
      expect(result?.getId()).toBe('import-1');
    });

    it('should return null when the import job does not exist', async () => {
      csvImportModel.findById.mockReturnValue(chain(null));

      await expect(repository.findById('unknown')).resolves.toBeNull();
      expect(mapper.toEntity).not.toHaveBeenCalled();
    });

    it('should propagate a query failure', async () => {
      csvImportModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('connection lost')),
      });

      await expect(repository.findById('import-1')).rejects.toThrow(
        'connection lost',
      );
    });
  });
});
