import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AccountingExportService } from './accounting-export.service';
import {
  AccountingExportDeliveryMode,
  AccountingExportFormat,
  CreateAccountingExportDto,
} from '@features/professional/domains/dtos/accounting-export.dto';
import { AccountingRow } from '@features/professional/utils/accounting-csv';

const CENTER_ID = '68b4d59919d9b7a94b4fde21';
const USER_ID = '68b4d59919d9b7a94b4fde22';

describe('AccountingExportService', () => {
  let service: AccountingExportService;
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAccountingRows: jest.Mock;
    markReady: jest.Mock;
  };
  let centerService: { findAllByOwnerId: jest.Mock };
  let uploadService: { upload: jest.Mock };

  const row = (overrides: Partial<AccountingRow> = {}): AccountingRow => ({
    bookingId: 'booking-1',
    bookingDate: new Date('2026-09-01T10:00:00.000Z'),
    slotDate: new Date('2026-09-15T08:00:00.000Z'),
    activityTitle: 'Parapente',
    customerName: 'Marie Dupont',
    participants: 2,
    status: 'confirmed',
    totalEur: 240,
    vatEur: 40,
    paidEur: 240,
    refundedEur: 0,
    ...overrides,
  });

  const dto = (
    overrides: Partial<CreateAccountingExportDto> = {},
  ): CreateAccountingExportDto =>
    ({
      format: AccountingExportFormat.CSV_GENERIC,
      from: '2026-09-01',
      to: '2026-09-30',
      includeRefunds: false,
      deliveryMode: AccountingExportDeliveryMode.DOWNLOAD,
      centerId: CENTER_ID,
      ...overrides,
    }) as CreateAccountingExportDto;

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockResolvedValue({ getId: () => 'job-1' }),
      findById: jest.fn(),
      findAccountingRows: jest.fn().mockResolvedValue([]),
      markReady: jest.fn().mockResolvedValue(undefined),
    };
    centerService = {
      findAllByOwnerId: jest
        .fn()
        .mockResolvedValue([{ getId: () => CENTER_ID }]),
    };
    uploadService = {
      upload: jest.fn().mockResolvedValue({ fileId: 'file-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingExportService,
        { provide: 'IAccountingExportRepository', useValue: repository },
        { provide: 'IProfessionalCenterService', useValue: centerService },
        { provide: 'IUploadService', useValue: uploadService },
      ],
    }).compile();

    service = module.get<AccountingExportService>(AccountingExportService);
  });

  it('stores a CSV file and returns its download url', async () => {
    repository.findAccountingRows.mockResolvedValue([row(), row()]);

    const result = await service.createExport(dto(), USER_ID);

    expect(result.status).toBe('ready');
    expect(result.recordsCount).toBe(2);
    expect(result.downloadUrl).toBe('/uploads/file-1');
    expect(uploadService.upload).toHaveBeenCalledWith(
      expect.objectContaining({ mimetype: 'text/csv' }),
      USER_ID,
    );
  });

  it('writes the rows into the uploaded file', async () => {
    repository.findAccountingRows.mockResolvedValue([row()]);

    await service.createExport(dto(), USER_ID);

    const uploaded = uploadService.upload.mock.calls[0][0] as {
      buffer: Buffer;
    };
    const content = uploaded.buffer.toString('utf8');
    expect(content).toContain('Parapente');
    expect(content).toContain('Marie Dupont');
    // Montants a la virgule, comme les tableurs francais les attendent.
    expect(content).toContain('240,00');
  });

  it('marks the job ready with the row count', async () => {
    repository.findAccountingRows.mockResolvedValue([row(), row(), row()]);

    await service.createExport(dto(), USER_ID);

    expect(repository.markReady).toHaveBeenCalledWith(
      'job-1',
      '/uploads/file-1',
      3,
    );
  });

  it('queries the requested period', async () => {
    await service.createExport(dto(), USER_ID);

    expect(repository.findAccountingRows).toHaveBeenCalledWith(
      CENTER_ID,
      new Date('2026-09-01'),
      new Date('2026-09-30'),
    );
  });

  it('produces a header-only file when nothing matches', async () => {
    const result = await service.createExport(dto(), USER_ID);

    expect(result.recordsCount).toBe(0);
    const uploaded = uploadService.upload.mock.calls[0][0] as {
      buffer: Buffer;
    };
    expect(uploaded.buffer.toString('utf8')).toContain('Reservation');
  });

  it('rejects a reversed date range', async () => {
    await expect(
      service.createExport(
        dto({ from: '2026-09-30', to: '2026-09-01' }),
        USER_ID,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unreadable date', async () => {
    await expect(
      service.createExport(dto({ from: 'pas une date' }), USER_ID),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a center the professional does not own', async () => {
    centerService.findAllByOwnerId.mockResolvedValue([
      { getId: () => 'another-center' },
    ]);

    await expect(service.createExport(dto(), USER_ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(uploadService.upload).not.toHaveBeenCalled();
  });

  it('falls back to the only center when none is given', async () => {
    await service.createExport(dto({ centerId: undefined }), USER_ID);

    expect(repository.findAccountingRows).toHaveBeenCalledWith(
      CENTER_ID,
      expect.any(Date),
      expect.any(Date),
    );
  });

  it('asks which center when several could match', async () => {
    centerService.findAllByOwnerId.mockResolvedValue([
      { getId: () => CENTER_ID },
      { getId: () => 'second-center' },
    ]);

    await expect(
      service.createExport(dto({ centerId: undefined }), USER_ID),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
