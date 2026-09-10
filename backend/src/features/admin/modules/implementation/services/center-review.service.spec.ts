import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CenterReviewService } from './center-review.service';
import { ICenterReviewRepository } from '@features/admin/interfaces/repositories/center-review.irepository';
import { IProfessionalCenterService } from '@features/professional/interfaces/services/professional-center.iservice';
import { ISensitiveActionLogService } from '@features/admin/interfaces/services/sensitive-action-log.iservice';
import { ProfessionalCenter } from '@features/professional/domains/schemas/professional-center.schema';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';
import { CenterReviewEntity } from '@features/admin/domains/entities/center-review.entity';
import { SensitiveActionLogEntity } from '@features/admin/domains/entities/sensitive-action-log.entity';
import {
  PendingCenterDto,
  ReviewCenterDto,
} from '@features/admin/domains/dtos/center-review.dto';

describe('CenterReviewService', () => {
  const CENTER_ID = '68b4d59919d9b7a94b4fde21';
  const ADMIN_ID = '68b4d59919d9b7a94b4fde22';

  let service: CenterReviewService;
  let centerReviewRepository: jest.Mocked<ICenterReviewRepository>;
  let professionalCenterService: jest.Mocked<IProfessionalCenterService>;
  let sensitiveActionLogService: jest.Mocked<ISensitiveActionLogService>;
  let professionalCenterModel: { findByIdAndUpdate: jest.Mock };
  let modelExec: jest.Mock;

  const buildCenter = (status: string): ProfessionalCenterEntity =>
    ({
      getStatus: jest.fn().mockReturnValue(status),
    }) as unknown as ProfessionalCenterEntity;

  const buildReviewEntity = (
    id = 'review-1',
    notificationSent = false,
  ): CenterReviewEntity =>
    ({
      getId: jest.fn().mockReturnValue(id),
      getNotificationSent: jest.fn().mockReturnValue(notificationSent),
    }) as unknown as CenterReviewEntity;

  const buildPendingCenter = (): PendingCenterDto => ({
    id: CENTER_ID,
    name: 'Chamonix Vertical SARL',
    email: 'contact@chamonix-vertical.fr',
    phone: '+33450531234',
    siret: '49317019200019',
    city: 'Chamonix',
    status: 'pending_review',
    submittedAt: '2026-08-19T21:51:00.000Z',
  });

  beforeEach(async () => {
    modelExec = jest.fn().mockResolvedValue(null);
    professionalCenterModel = {
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: modelExec }),
    };

    const centerReviewRepositoryMock = {
      findAll: jest.fn(),
      findCenters: jest.fn(),
      findCenterById: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    const professionalCenterServiceMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByOwnerId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const sensitiveActionLogServiceMock = {
      findAuditLogs: jest.fn(),
      createLog: jest.fn().mockResolvedValue({} as SensitiveActionLogEntity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CenterReviewService,
        {
          provide: 'ICenterReviewRepository',
          useValue: centerReviewRepositoryMock,
        },
        {
          provide: 'IProfessionalCenterService',
          useValue: professionalCenterServiceMock,
        },
        {
          provide: 'ISensitiveActionLogService',
          useValue: sensitiveActionLogServiceMock,
        },
        {
          provide: getModelToken(ProfessionalCenter.name),
          useValue: professionalCenterModel,
        },
      ],
    }).compile();

    service = module.get<CenterReviewService>(CenterReviewService);
    centerReviewRepository = module.get('ICenterReviewRepository');
    professionalCenterService = module.get('IProfessionalCenterService');
    sensitiveActionLogService = module.get('ISensitiveActionLogService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reviewCenter()', () => {
    const approveDto: ReviewCenterDto = {
      decision: 'approve',
      internalComment: 'Documents look valid',
    };

    it('should approve a pending dossier and return the new status', async () => {
      professionalCenterService.findById.mockResolvedValue(
        buildCenter('pending_review'),
      );
      centerReviewRepository.create.mockResolvedValue(
        buildReviewEntity('review-1', true),
      );

      const result = await service.reviewCenter(
        CENTER_ID,
        approveDto,
        ADMIN_ID,
        'admin',
      );

      expect(result).toEqual({
        centerId: CENTER_ID,
        newStatus: 'approved',
        reviewedAt: expect.any(String),
        reviewedBy: ADMIN_ID,
        notificationSent: true,
      });
      expect(professionalCenterModel.findByIdAndUpdate).toHaveBeenCalledWith(
        CENTER_ID,
        { status: 'approved' },
        { new: true },
      );
      expect(modelExec).toHaveBeenCalled();
    });

    it('should persist the review with the center and admin object ids', async () => {
      professionalCenterService.findById.mockResolvedValue(
        buildCenter('pending_review'),
      );
      centerReviewRepository.create.mockResolvedValue(buildReviewEntity());

      await service.reviewCenter(CENTER_ID, approveDto, ADMIN_ID, 'admin');

      const persisted = centerReviewRepository.create.mock
        .calls[0][0] as unknown as Record<string, unknown>;
      expect(persisted.decision).toBe('approve');
      expect(persisted.internalComment).toBe('Documents look valid');
      expect(String(persisted.centerId)).toBe(CENTER_ID);
      expect(String(persisted.reviewedBy)).toBe(ADMIN_ID);
      expect(persisted.notificationSent).toBe(false);
    });

    it('should map a rejection to the "rejected" status and a "warning" severity', async () => {
      professionalCenterService.findById.mockResolvedValue(
        buildCenter('pending_review'),
      );
      centerReviewRepository.create.mockResolvedValue(buildReviewEntity());

      const result = await service.reviewCenter(
        CENTER_ID,
        { decision: 'reject', rejectionReason: 'incomplete_kbis' },
        ADMIN_ID,
        'admin',
      );

      expect(result.newStatus).toBe('rejected');
      expect(sensitiveActionLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: ADMIN_ID,
          actorRole: 'admin',
          actionType: 'center.reviewed',
          targetType: 'ProfessionalCenter',
          targetId: CENTER_ID,
          severity: 'warning',
        }),
      );
    });

    it('should map a request for more info to the "awaiting_info" status', async () => {
      professionalCenterService.findById.mockResolvedValue(
        buildCenter('pending_review'),
      );
      centerReviewRepository.create.mockResolvedValue(buildReviewEntity());

      const result = await service.reviewCenter(
        CENTER_ID,
        { decision: 'request_more_info' },
        ADMIN_ID,
        'admin',
      );

      expect(result.newStatus).toBe('awaiting_info');
      expect(sensitiveActionLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'info' }),
      );
    });

    it('should record the decision details in the sensitive action log metadata', async () => {
      professionalCenterService.findById.mockResolvedValue(
        buildCenter('pending_review'),
      );
      centerReviewRepository.create.mockResolvedValue(
        buildReviewEntity('review-42'),
      );

      await service.reviewCenter(
        CENTER_ID,
        {
          decision: 'reject',
          rejectionReason: 'expired_insurance',
          internalComment: 'Insurance expired last month',
        },
        ADMIN_ID,
        'admin',
      );

      expect(sensitiveActionLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            decision: 'reject',
            previousStatus: 'pending_review',
            newStatus: 'rejected',
            rejectionReason: 'expired_insurance',
            internalComment: 'Insurance expired last month',
            centerReviewId: 'review-42',
          },
        }),
      );
    });

    it('should throw NotFoundException when the center does not exist', async () => {
      professionalCenterService.findById.mockResolvedValue(null);

      await expect(
        service.reviewCenter(CENTER_ID, approveDto, ADMIN_ID, 'admin'),
      ).rejects.toThrow(
        new NotFoundException(`Center with id ${CENTER_ID} not found`),
      );
      expect(centerReviewRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the dossier is already processed', async () => {
      professionalCenterService.findById.mockResolvedValue(
        buildCenter('approved'),
      );

      await expect(
        service.reviewCenter(CENTER_ID, approveDto, ADMIN_ID, 'admin'),
      ).rejects.toThrow(ConflictException);
      expect(centerReviewRepository.create).not.toHaveBeenCalled();
      expect(sensitiveActionLogService.createLog).not.toHaveBeenCalled();
    });

    it('should propagate an error raised while persisting the review', async () => {
      professionalCenterService.findById.mockResolvedValue(
        buildCenter('pending_review'),
      );
      centerReviewRepository.create.mockRejectedValue(new Error('db down'));

      await expect(
        service.reviewCenter(CENTER_ID, approveDto, ADMIN_ID, 'admin'),
      ).rejects.toThrow('db down');
      expect(professionalCenterModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('listCenters()', () => {
    it('should return every dossier when no status filter is given', async () => {
      const centers = [buildPendingCenter()];
      centerReviewRepository.findCenters.mockResolvedValue(centers);

      const result = await service.listCenters();

      expect(result).toEqual(centers);
      expect(centerReviewRepository.findCenters).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should forward the status filter to the repository', async () => {
      centerReviewRepository.findCenters.mockResolvedValue([]);

      const result = await service.listCenters('rejected');

      expect(result).toEqual([]);
      expect(centerReviewRepository.findCenters).toHaveBeenCalledWith(
        'rejected',
      );
    });
  });

  describe('getCenter()', () => {
    it('should return the dossier found by the repository', async () => {
      const center = buildPendingCenter();
      centerReviewRepository.findCenterById.mockResolvedValue(center);

      const result = await service.getCenter(CENTER_ID);

      expect(result).toEqual(center);
      expect(centerReviewRepository.findCenterById).toHaveBeenCalledWith(
        CENTER_ID,
      );
    });

    it('should throw NotFoundException when the dossier does not exist', async () => {
      centerReviewRepository.findCenterById.mockResolvedValue(null);

      await expect(service.getCenter('missing')).rejects.toThrow(
        new NotFoundException('Dossier de centre introuvable'),
      );
    });
  });
});
