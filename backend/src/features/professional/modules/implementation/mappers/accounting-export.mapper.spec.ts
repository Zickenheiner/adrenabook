import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AccountingExportMapper } from './accounting-export.mapper';
import { AccountingExportDocument } from '@features/professional/domains/schemas/accounting-export.schema';

describe('AccountingExportMapper', () => {
  let mapper: AccountingExportMapper;

  const objectId = new Types.ObjectId();
  const professionalId = new Types.ObjectId();
  const from = new Date('2026-01-01T00:00:00.000Z');
  const to = new Date('2026-03-31T23:59:59.000Z');

  // Fabrique un faux document Mongoose : seules les proprietes lues par le
  // mapper sont necessaires, d'ou le double cast.
  const buildDocument = (
    overrides: Record<string, unknown> = {},
  ): AccountingExportDocument =>
    ({
      _id: objectId,
      format: 'sage50',
      from,
      to,
      includeRefunds: true,
      deliveryMode: 'download',
      status: 'ready',
      downloadUrl: 'https://example.com/exports/export-1.csv',
      emailDeliveredTo: 'compta@example.com',
      recordsCount: 42,
      professionalId,
      ...overrides,
    }) as unknown as AccountingExportDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingExportMapper],
    }).compile();
    mapper = module.get<AccountingExportMapper>(AccountingExportMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('toEntity()', () => {
    it('should map every field of the document', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getId()).toBe(objectId.toString());
      expect(entity.getObjectId()).toBe(objectId);
      expect(entity.getFormat()).toBe('sage50');
      expect(entity.getFrom()).toBe(from);
      expect(entity.getTo()).toBe(to);
      expect(entity.getIncludeRefunds()).toBe(true);
      expect(entity.getDeliveryMode()).toBe('download');
      expect(entity.getStatus()).toBe('ready');
      expect(entity.getDownloadUrl()).toBe(
        'https://example.com/exports/export-1.csv',
      );
      expect(entity.getEmailDeliveredTo()).toBe('compta@example.com');
      expect(entity.getRecordsCount()).toBe(42);
      expect(entity.getProfessionalId()).toBe(professionalId);
    });

    it('should map the optional fields left undefined', () => {
      const entity = mapper.toEntity(
        buildDocument({
          downloadUrl: undefined,
          emailDeliveredTo: undefined,
        }),
      );

      expect(entity.getDownloadUrl()).toBeUndefined();
      expect(entity.getEmailDeliveredTo()).toBeUndefined();
    });

    it('should map a queued email export', () => {
      const entity = mapper.toEntity(
        buildDocument({
          format: 'csv_generic',
          deliveryMode: 'email',
          status: 'queued',
          includeRefunds: false,
          recordsCount: 0,
        }),
      );

      expect(entity.getFormat()).toBe('csv_generic');
      expect(entity.getDeliveryMode()).toBe('email');
      expect(entity.getStatus()).toBe('queued');
      expect(entity.getIncludeRefunds()).toBe(false);
      expect(entity.getRecordsCount()).toBe(0);
    });

    it('should keep the professional ObjectId untouched', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getProfessionalId()).toBeInstanceOf(Types.ObjectId);
    });

    it('should return a new entity on each call', () => {
      const doc = buildDocument();

      expect(mapper.toEntity(doc)).not.toBe(mapper.toEntity(doc));
    });
  });
});
