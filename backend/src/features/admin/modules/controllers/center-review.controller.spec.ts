import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CenterReviewController } from './center-review.controller';
import { ICenterReviewService } from '@features/admin/interfaces/services/center-review.iservice';
import {
  PendingCenterDto,
  ReviewCenterDto,
  ReviewCenterResponseDto,
} from '@features/admin/domains/dtos/center-review.dto';

describe('CenterReviewController', () => {
  let controller: CenterReviewController;
  let centerReviewService: jest.Mocked<ICenterReviewService>;

  const buildPendingCenter = (): PendingCenterDto => ({
    id: '68b4d59919d9b7a94b4fde21',
    name: 'Chamonix Vertical SARL',
    email: 'contact@chamonix-vertical.fr',
    phone: '+33450531234',
    siret: '49317019200019',
    city: 'Chamonix',
    status: 'pending_review',
    submittedAt: '2026-08-19T21:51:00.000Z',
  });

  beforeEach(async () => {
    const centerReviewServiceMock: jest.Mocked<ICenterReviewService> = {
      reviewCenter: jest.fn(),
      listCenters: jest.fn(),
      getCenter: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CenterReviewController],
      providers: [
        {
          provide: 'ICenterReviewService',
          useValue: centerReviewServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CenterReviewController>(CenterReviewController);
    centerReviewService = module.get('ICenterReviewService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reviewCenter()', () => {
    const dto: ReviewCenterDto = {
      decision: 'approve',
      internalComment: 'Documents look valid',
    };

    it('should forward the id, the dto and the authenticated admin to the service', async () => {
      const expected: ReviewCenterResponseDto = {
        centerId: 'center-1',
        newStatus: 'approved',
        reviewedAt: '2026-05-11T10:00:00.000Z',
        reviewedBy: 'admin-1',
        notificationSent: true,
      };
      centerReviewService.reviewCenter.mockResolvedValue(expected);

      const result = await controller.reviewCenter('center-1', dto, {
        user: { sub: 'admin-1', role: 'admin' },
      });

      expect(result).toEqual(expected);
      expect(centerReviewService.reviewCenter).toHaveBeenCalledWith(
        'center-1',
        dto,
        'admin-1',
        'admin',
      );
    });

    it('should fall back to the "unknown" role when the JWT payload carries none', async () => {
      centerReviewService.reviewCenter.mockResolvedValue(
        {} as ReviewCenterResponseDto,
      );

      await controller.reviewCenter('center-1', dto, {
        user: { sub: 'admin-1' },
      });

      expect(centerReviewService.reviewCenter).toHaveBeenCalledWith(
        'center-1',
        dto,
        'admin-1',
        'unknown',
      );
    });

    it('should propagate a NotFoundException raised by the service', async () => {
      centerReviewService.reviewCenter.mockRejectedValue(
        new NotFoundException('Center with id center-1 not found'),
      );

      await expect(
        controller.reviewCenter('center-1', dto, {
          user: { sub: 'admin-1', role: 'admin' },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should propagate a ConflictException when the dossier is already processed', async () => {
      centerReviewService.reviewCenter.mockRejectedValue(
        new ConflictException('Center dossier has already been processed'),
      );

      await expect(
        controller.reviewCenter('center-1', dto, {
          user: { sub: 'admin-1', role: 'admin' },
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('list()', () => {
    it('should return the centers returned by the service', async () => {
      const centers = [buildPendingCenter()];
      centerReviewService.listCenters.mockResolvedValue(centers);

      const result = await controller.list();

      expect(result).toEqual(centers);
      expect(centerReviewService.listCenters).toHaveBeenCalledWith(undefined);
    });

    it('should forward the status filter to the service', async () => {
      centerReviewService.listCenters.mockResolvedValue([]);

      const result = await controller.list('approved');

      expect(result).toEqual([]);
      expect(centerReviewService.listCenters).toHaveBeenCalledWith('approved');
    });

    it('should propagate errors thrown by the service', async () => {
      centerReviewService.listCenters.mockRejectedValue(new Error('boom'));

      await expect(controller.list()).rejects.toThrow('boom');
    });
  });

  describe('getOne()', () => {
    it('should return the dossier matching the given id', async () => {
      const center = buildPendingCenter();
      centerReviewService.getCenter.mockResolvedValue(center);

      const result = await controller.getOne(center.id);

      expect(result).toEqual(center);
      expect(centerReviewService.getCenter).toHaveBeenCalledWith(center.id);
    });

    it('should propagate a NotFoundException for an unknown dossier', async () => {
      centerReviewService.getCenter.mockRejectedValue(
        new NotFoundException('Dossier de centre introuvable'),
      );

      await expect(controller.getOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
