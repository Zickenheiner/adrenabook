import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ActivityMapper } from './activity.mapper';
import { ActivityDocument } from '@features/activity/domains/schemas/activity.schema';

describe('ActivityMapper', () => {
  let mapper: ActivityMapper;

  const objectId = new Types.ObjectId();
  const centerId = new Types.ObjectId();
  const createdAt = new Date('2026-07-01T10:00:00.000Z');

  // Fabrique un faux document Mongoose : seules les proprietes lues par le
  // mapper sont necessaires, d'ou le double cast.
  const buildDocument = (
    overrides: Record<string, unknown> = {},
  ): ActivityDocument =>
    ({
      _id: objectId,
      title: 'Escalade Fontainebleau',
      description: 'Une sortie bloc encadree',
      type: 'climbing',
      difficulty: 'beginner',
      durationMinutes: 180,
      priceFromEur: 90,
      prerequisites: {
        minAge: 12,
        maxAge: 65,
        minWeightKg: 40,
        maxWeightKg: 110,
        medicalCertificateRequired: true,
      },
      includedEquipment: ['casque', 'baudrier'],
      photoFileIds: ['file_1', 'file_2'],
      status: 'published',
      centerId,
      createdAt,
      ...overrides,
    }) as unknown as ActivityDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityMapper],
    }).compile();
    mapper = module.get<ActivityMapper>(ActivityMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('toEntity()', () => {
    it('should map every field of the document', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getId()).toBe(objectId.toString());
      expect(entity.getObjectId()).toBe(objectId);
      expect(entity.getTitle()).toBe('Escalade Fontainebleau');
      expect(entity.getDescription()).toBe('Une sortie bloc encadree');
      expect(entity.getType()).toBe('climbing');
      expect(entity.getDifficulty()).toBe('beginner');
      expect(entity.getDurationMinutes()).toBe(180);
      expect(entity.getPriceFromEur()).toBe(90);
      expect(entity.getPrerequisites()).toEqual({
        minAge: 12,
        maxAge: 65,
        minWeightKg: 40,
        maxWeightKg: 110,
        medicalCertificateRequired: true,
      });
      expect(entity.getIncludedEquipment()).toEqual(['casque', 'baudrier']);
      expect(entity.getPhotoFileIds()).toEqual(['file_1', 'file_2']);
      expect(entity.getStatus()).toBe('published');
      expect(entity.getCenterId()).toBe(centerId);
      expect(entity.getCreatedAt()).toBe(createdAt);
    });

    it('should keep the prerequisites reference untouched', () => {
      const doc = buildDocument();

      const entity = mapper.toEntity(doc);

      expect(entity.getPrerequisites()).toBe(doc.prerequisites);
    });

    it('should map optional prerequisites left undefined', () => {
      const entity = mapper.toEntity(
        buildDocument({
          prerequisites: { minAge: 18, medicalCertificateRequired: false },
        }),
      );

      expect(entity.getPrerequisites()).toEqual({
        minAge: 18,
        medicalCertificateRequired: false,
      });
    });

    it('should map empty arrays', () => {
      const entity = mapper.toEntity(
        buildDocument({ includedEquipment: [], photoFileIds: [] }),
      );

      expect(entity.getIncludedEquipment()).toEqual([]);
      expect(entity.getPhotoFileIds()).toEqual([]);
    });

    it('should leave the createdAt undefined when the document has none', () => {
      const entity = mapper.toEntity(buildDocument({ createdAt: undefined }));

      expect(entity.getCreatedAt()).toBeUndefined();
    });

    it('should ignore a falsy createdAt', () => {
      const entity = mapper.toEntity(buildDocument({ createdAt: null }));

      expect(entity.getCreatedAt()).toBeUndefined();
    });

    it('should return a new entity on each call', () => {
      const doc = buildDocument();

      expect(mapper.toEntity(doc)).not.toBe(mapper.toEntity(doc));
    });
  });
});
