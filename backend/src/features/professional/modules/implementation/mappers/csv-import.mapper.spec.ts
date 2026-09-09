import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CsvImportMapper } from './csv-import.mapper';
import { CsvImportDocument } from '@features/professional/domains/schemas/csv-import.schema';

describe('CsvImportMapper', () => {
  let mapper: CsvImportMapper;

  const objectId = new Types.ObjectId();
  const professionalId = new Types.ObjectId();

  // Fabrique un faux document Mongoose : seules les proprietes lues par le
  // mapper sont necessaires, d'ou le double cast.
  const buildDocument = (
    overrides: Record<string, unknown> = {},
  ): CsvImportDocument =>
    ({
      _id: objectId,
      entityType: 'slots',
      fileId: 'file_csv_1',
      columnMapping: new Map([
        ['date', 'startAt'],
        ['places', 'capacity'],
      ]),
      dryRun: true,
      status: 'completed',
      rowsTotal: 10,
      rowsSuccess: 8,
      rowsErrors: 2,
      errors: [
        { line: 3, column: 'date', reason: 'Format invalide' },
        { line: 7, column: 'places', reason: 'Valeur negative' },
      ],
      professionalId,
      ...overrides,
    }) as unknown as CsvImportDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvImportMapper],
    }).compile();
    mapper = module.get<CsvImportMapper>(CsvImportMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('toEntity()', () => {
    it('should map every field of the document', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getId()).toBe(objectId.toString());
      expect(entity.getObjectId()).toBe(objectId);
      expect(entity.getEntityType()).toBe('slots');
      expect(entity.getFileId()).toBe('file_csv_1');
      expect(entity.getDryRun()).toBe(true);
      expect(entity.getStatus()).toBe('completed');
      expect(entity.getRowsTotal()).toBe(10);
      expect(entity.getRowsSuccess()).toBe(8);
      expect(entity.getRowsErrors()).toBe(2);
      expect(entity.getErrors()).toEqual([
        { line: 3, column: 'date', reason: 'Format invalide' },
        { line: 7, column: 'places', reason: 'Valeur negative' },
      ]);
      expect(entity.getProfessionalId()).toBe(professionalId.toString());
    });

    it('should convert the column mapping Map into a plain object', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getColumnMapping()).toEqual({
        date: 'startAt',
        places: 'capacity',
      });
    });

    it('should convert an empty column mapping into an empty object', () => {
      const entity = mapper.toEntity(
        buildDocument({ columnMapping: new Map<string, string>() }),
      );

      expect(entity.getColumnMapping()).toEqual({});
    });

    it('should map an empty error list', () => {
      const entity = mapper.toEntity(
        buildDocument({ status: 'queued', errors: [] }),
      );

      expect(entity.getErrors()).toEqual([]);
      expect(entity.getStatus()).toBe('queued');
    });

    it('should map a zeroed counter set', () => {
      const entity = mapper.toEntity(
        buildDocument({
          rowsTotal: 0,
          rowsSuccess: 0,
          rowsErrors: 0,
          dryRun: false,
        }),
      );

      expect(entity.getRowsTotal()).toBe(0);
      expect(entity.getRowsSuccess()).toBe(0);
      expect(entity.getRowsErrors()).toBe(0);
      expect(entity.getDryRun()).toBe(false);
    });

    it('should stringify the professional ObjectId', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(typeof entity.getProfessionalId()).toBe('string');
    });

    it('should return a new entity on each call', () => {
      const doc = buildDocument();

      expect(mapper.toEntity(doc)).not.toBe(mapper.toEntity(doc));
    });
  });
});
