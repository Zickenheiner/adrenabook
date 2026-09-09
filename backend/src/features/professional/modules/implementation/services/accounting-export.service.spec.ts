import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AccountingExportService } from './accounting-export.service';
import { IAccountingExportRepository } from '@features/professional/interfaces/repositories/accounting-export.irepository';
import { AccountingExportEntity } from '@features/professional/domains/entities/accounting-export.entity';
import {
  AccountingExportDeliveryMode,
  AccountingExportFormat,
  CreateAccountingExportDto,
} from '@features/professional/domains/dtos/accounting-export.dto';

describe('AccountingExportService', () => {
  let service: AccountingExportService;
  let repository: jest.Mocked<IAccountingExportRepository>;

  const professionalId = '68b4d59919d9b7a94b4fde10';
  const professionalEmail = 'pro@example.com';
  const exportJobId = '68b4d59919d9b7a94b4fde21';

  // Entite renvoyee par le repository, alimentee via ses setters
  const buildEntity = (overrides?: {
    status?: string;
    recordsCount?: number;
    downloadUrl?: string;
  }): AccountingExportEntity => {
    const entity = new AccountingExportEntity(exportJobId as never);
    entity.setStatus(overrides?.status ?? 'queued');
    entity.setRecordsCount(overrides?.recordsCount ?? 0);
    entity.setDownloadUrl(overrides?.downloadUrl);
    return entity;
  };

  const buildDto = (
    overrides: Partial<CreateAccountingExportDto> = {},
  ): CreateAccountingExportDto => ({
    format: AccountingExportFormat.CSV_GENERIC,
    from: '2026-01-01',
    to: '2026-03-31',
    includeRefunds: false,
    deliveryMode: AccountingExportDeliveryMode.DOWNLOAD,
    ...overrides,
  });

  beforeEach(async () => {
    const repositoryMock: jest.Mocked<IAccountingExportRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingExportService,
        {
          provide: 'IAccountingExportRepository',
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<AccountingExportService>(AccountingExportService);
    repository = module.get('IAccountingExportRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExport()', () => {
    it('should create the export and return a download url in download mode', async () => {
      repository.create.mockResolvedValue(
        buildEntity({
          status: 'ready',
          recordsCount: 42,
          downloadUrl: 'https://cdn.adrenabook.com/exports/export-2026.csv',
        }),
      );
      const dto = buildDto();

      const result = await service.createExport(
        dto,
        professionalId,
        professionalEmail,
      );

      expect(result).toEqual({
        exportJobId,
        status: 'ready',
        recordsCount: 42,
        downloadUrl: 'https://cdn.adrenabook.com/exports/export-2026.csv',
      });
      expect(repository.create).toHaveBeenCalledWith(dto, professionalId);
      expect(result.emailDeliveredTo).toBeUndefined();
    });

    it('should return the professional email in email delivery mode', async () => {
      repository.create.mockResolvedValue(buildEntity());

      const result = await service.createExport(
        buildDto({ deliveryMode: AccountingExportDeliveryMode.EMAIL }),
        professionalId,
        professionalEmail,
      );

      expect(result.emailDeliveredTo).toBe(professionalEmail);
      expect(result.downloadUrl).toBeUndefined();
      expect(result.status).toBe('queued');
    });

    it('should leave the download url undefined when the export is not ready yet', async () => {
      repository.create.mockResolvedValue(buildEntity());

      const result = await service.createExport(
        buildDto(),
        professionalId,
        professionalEmail,
      );

      expect(result.downloadUrl).toBeUndefined();
      expect(result.recordsCount).toBe(0);
    });

    it('should accept an ISO 8601 date-time range', async () => {
      repository.create.mockResolvedValue(buildEntity());

      await expect(
        service.createExport(
          buildDto({
            from: '2026-01-01T00:00:00.000Z',
            to: '2026-03-31T23:59:59.000Z',
          }),
          professionalId,
          professionalEmail,
        ),
      ).resolves.toBeDefined();
    });

    it('should throw a BadRequestException when the start date is unparseable', async () => {
      await expect(
        service.createExport(
          buildDto({ from: 'not-a-date' }),
          professionalId,
          professionalEmail,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when the end date is unparseable', async () => {
      await expect(
        service.createExport(
          buildDto({ to: 'not-a-date' }),
          professionalId,
          professionalEmail,
        ),
      ).rejects.toThrow('Invalid date range');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when the range is inverted', async () => {
      await expect(
        service.createExport(
          buildDto({ from: '2026-03-31', to: '2026-01-01' }),
          professionalId,
          professionalEmail,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when both dates are equal', async () => {
      await expect(
        service.createExport(
          buildDto({ from: '2026-01-01', to: '2026-01-01' }),
          professionalId,
          professionalEmail,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should propagate a repository failure', async () => {
      repository.create.mockRejectedValue(new Error('database down'));

      await expect(
        service.createExport(buildDto(), professionalId, professionalEmail),
      ).rejects.toThrow('database down');
    });
  });
});
