import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { SensitiveActionLogMapper } from './sensitive-action-log.mapper';
import { SensitiveActionLogDocument } from '@features/admin/domains/schemas/sensitive-action-log.schema';

describe('SensitiveActionLogMapper', () => {
  let mapper: SensitiveActionLogMapper;

  const objectId = new Types.ObjectId();
  const createdAt = new Date('2026-08-01T09:30:00.000Z');

  // Fabrique un faux document Mongoose : seules les proprietes lues par le
  // mapper sont necessaires, d'ou le double cast.
  const buildDocument = (
    overrides: Record<string, unknown> = {},
  ): SensitiveActionLogDocument =>
    ({
      _id: objectId,
      actorId: '68b4d59919d9b7a94b4fde21',
      actorRole: 'admin',
      actionType: 'user.status_changed',
      targetType: 'User',
      targetId: '68b4d59919d9b7a94b4fde22',
      severity: 'critical',
      ipAddress: '203.0.113.42',
      userAgent: 'Mozilla/5.0',
      metadata: { previousStatus: 'active', newStatus: 'suspended' },
      integrityHash: 'hash-abc',
      createdAt,
      ...overrides,
    }) as unknown as SensitiveActionLogDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensitiveActionLogMapper],
    }).compile();
    mapper = module.get<SensitiveActionLogMapper>(SensitiveActionLogMapper);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('toEntity()', () => {
    it('should map every field of the document', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getId()).toBe(objectId.toString());
      expect(entity.getObjectId()).toBe(objectId);
      expect(entity.getActorId()).toBe('68b4d59919d9b7a94b4fde21');
      expect(entity.getActorRole()).toBe('admin');
      expect(entity.getActionType()).toBe('user.status_changed');
      expect(entity.getTargetType()).toBe('User');
      expect(entity.getTargetId()).toBe('68b4d59919d9b7a94b4fde22');
      expect(entity.getSeverity()).toBe('critical');
      expect(entity.getIpAddress()).toBe('203.0.113.42');
      expect(entity.getUserAgent()).toBe('Mozilla/5.0');
      expect(entity.getMetadata()).toEqual({
        previousStatus: 'active',
        newStatus: 'suspended',
      });
      expect(entity.getIntegrityHash()).toBe('hash-abc');
      expect(entity.getTimestamp()).toBe(createdAt);
    });

    it('should map the optional fields left undefined', () => {
      const entity = mapper.toEntity(
        buildDocument({
          ipAddress: undefined,
          userAgent: undefined,
          metadata: undefined,
        }),
      );

      expect(entity.getIpAddress()).toBeUndefined();
      expect(entity.getUserAgent()).toBeUndefined();
      expect(entity.getMetadata()).toBeUndefined();
    });

    it('should fall back to the current date when the document has no createdAt', () => {
      const now = new Date('2026-08-20T12:00:00.000Z');
      jest.useFakeTimers().setSystemTime(now);

      const entity = mapper.toEntity(buildDocument({ createdAt: undefined }));

      expect(entity.getTimestamp()).toEqual(now);
    });

    it('should fall back to the current date when createdAt is null', () => {
      const now = new Date('2026-08-20T13:00:00.000Z');
      jest.useFakeTimers().setSystemTime(now);

      const entity = mapper.toEntity(buildDocument({ createdAt: null }));

      expect(entity.getTimestamp()).toEqual(now);
    });

    it('should keep an empty metadata object', () => {
      const entity = mapper.toEntity(buildDocument({ metadata: {} }));

      expect(entity.getMetadata()).toEqual({});
    });

    it('should map an informational login entry', () => {
      const entity = mapper.toEntity(
        buildDocument({
          actionType: 'auth.login',
          severity: 'info',
          targetType: 'Session',
        }),
      );

      expect(entity.getActionType()).toBe('auth.login');
      expect(entity.getSeverity()).toBe('info');
      expect(entity.getTargetType()).toBe('Session');
    });

    it('should return a new entity on each call', () => {
      const doc = buildDocument();

      expect(mapper.toEntity(doc)).not.toBe(mapper.toEntity(doc));
    });
  });
});
