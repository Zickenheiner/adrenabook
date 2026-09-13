import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ActivitySearchController } from './activity-search.controller';
import { IActivityService } from '@features/activity/interfaces/services/activity.iservice';
import {
  ActivityDetailResponseDto,
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
} from '@features/activity/domains/dtos/activity.dto';

describe('ActivitySearchController', () => {
  let controller: ActivitySearchController;
  let activityService: jest.Mocked<IActivityService>;
  let uploadService: {
    findPublicById: jest.Mock;
    openDownloadStream: jest.Mock;
  };

  const activityId = '68b4d59919d9b7a94b4fde21';

  beforeEach(async () => {
    const activityServiceMock: jest.Mocked<IActivityService> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findDetailById: jest.fn(),
      findSlotsByMonth: jest.fn(),
      findByCenterId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      isPublicPhoto: jest.fn(),
      findMine: jest.fn(),
    };

    const uploadServiceMock = {
      upload: jest.fn(),
      getForReader: jest.fn(),
      findPublicById: jest.fn(),
      openDownloadStream: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitySearchController],
      providers: [
        {
          provide: 'IActivityService',
          useValue: activityServiceMock,
        },
        {
          provide: 'IUploadService',
          useValue: uploadServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ActivitySearchController>(ActivitySearchController);
    activityService = module.get('IActivityService');
    uploadService = module.get('IUploadService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search()', () => {
    const expected: SearchActivitiesResponseDto = {
      items: [
        {
          id: activityId,
          title: 'Parachute en tandem',
          type: 'paragliding',
          priceEur: 150,
          durationMinutes: 60,
          difficulty: 'beginner',
          centerName: 'Centre Aventure Alpes',
          coverPhotoUrl: 'https://cdn.adrenabook.fr/photos/abc123.jpg',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    };

    it('should return the search results for an empty query', async () => {
      activityService.search.mockResolvedValue(expected);

      const result = await controller.search({});

      expect(result).toEqual(expected);
      expect(activityService.search).toHaveBeenCalledWith({});
      expect(activityService.search).toHaveBeenCalledTimes(1);
    });

    it('should forward every filter to the service untouched', async () => {
      activityService.search.mockResolvedValue(expected);
      const query: SearchActivitiesQueryDto = {
        query: 'parachute',
        type: 'paragliding',
        lat: 45.764,
        lng: 4.8357,
        radiusKm: 50,
        dateFrom: '2026-06-01',
        dateTo: '2026-06-30',
        priceMin: 50,
        priceMax: 300,
        difficulty: 'beginner',
        page: 2,
        pageSize: 10,
        sortBy: 'price_asc',
      };

      await controller.search(query);

      expect(activityService.search).toHaveBeenCalledWith(query);
    });

    it('should return an empty result set when nothing matches', async () => {
      activityService.search.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      const result = await controller.search({ query: 'inexistant' });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should propagate a BadRequestException on invalid parameters', async () => {
      activityService.search.mockRejectedValue(
        new BadRequestException('Paramètres invalides'),
      );

      await expect(controller.search({ pageSize: 999 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findSlotsByMonth()', () => {
    const payload = { slots: [], availableMonths: ['2026-09'] };

    it('should default to the current month when none is given', async () => {
      activityService.findSlotsByMonth.mockResolvedValue(payload);

      await controller.findSlotsByMonth(activityId, undefined);

      expect(activityService.findSlotsByMonth).toHaveBeenCalledWith(
        activityId,
        new Date().toISOString().slice(0, 7),
      );
    });

    it('should pass the requested month through', async () => {
      activityService.findSlotsByMonth.mockResolvedValue(payload);

      const result = await controller.findSlotsByMonth(activityId, '2027-03');

      expect(activityService.findSlotsByMonth).toHaveBeenCalledWith(
        activityId,
        '2027-03',
      );
      expect(result).toBe(payload);
    });

    it.each(['septembre', '2026-13', '2026-9', '2026'])(
      'should reject the malformed month %s',
      async (month) => {
        await expect(
          controller.findSlotsByMonth(activityId, month),
        ).rejects.toThrow(BadRequestException);
        expect(activityService.findSlotsByMonth).not.toHaveBeenCalled();
      },
    );

    it('should throw NotFoundException when the activity does not exist', async () => {
      activityService.findSlotsByMonth.mockResolvedValue(null);

      await expect(
        controller.findSlotsByMonth(activityId, '2026-09'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findDetail()', () => {
    const detail: ActivityDetailResponseDto = {
      id: activityId,
      title: 'Parachute en tandem',
      description: 'Saut en parachute en tandem avec un instructeur certifié',
      type: 'paragliding',
      difficulty: 'beginner',
      durationMinutes: 60,
      priceEur: 150,
      prerequisites: {
        minAge: 18,
        medicalCertificateRequired: false,
      },
      includedEquipment: ['combinaison', 'casque'],
      photos: [
        {
          url: 'https://cdn.adrenabook.fr/photos/abc123.jpg',
          alt: 'Saut au-dessus des Alpes',
        },
      ],
      videos: [
        {
          url: 'https://cdn.adrenabook.fr/videos/def456.mp4',
          thumbnail: 'https://cdn.adrenabook.fr/thumbnails/def456.jpg',
        },
      ],
      center: {
        id: '68b4d59919d9b7a94b4fde22',
        name: 'Centre Aventure Alpes',
        location: {
          lat: 45.764,
          lng: 4.8357,
          address: '12 Rue de la Montagne, 69001 Lyon, France',
        },
      },
      reviewsSummary: { count: 42, averageRating: 4.7 },
    };

    it('should return the activity detail', async () => {
      activityService.findDetailById.mockResolvedValue(detail);

      const result = await controller.findDetail(activityId);

      expect(result).toEqual(detail);
      expect(activityService.findDetailById).toHaveBeenCalledWith(activityId);
    });

    it('should throw a NotFoundException when the service returns null', async () => {
      activityService.findDetailById.mockResolvedValue(null);

      await expect(controller.findDetail('unknown')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findDetail('unknown')).rejects.toThrow(
        'Activité introuvable ou désactivée',
      );
    });

    it('should propagate a NotFoundException raised by the service', async () => {
      activityService.findDetailById.mockRejectedValue(
        new NotFoundException('Activité introuvable ou désactivée'),
      );

      await expect(controller.findDetail(activityId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('photo()', () => {
    const fileId = '68b4d59919d9b7a94b4fde99';

    const buildResponse = () => ({
      setHeader: jest.fn(),
    });

    it('streams a photo carried by a published activity', async () => {
      const pipe = jest.fn();
      activityService.isPublicPhoto.mockResolvedValue(true);
      uploadService.findPublicById.mockResolvedValue({
        getMimeType: () => 'image/jpeg',
        getSizeBytes: () => 1234,
      });
      uploadService.openDownloadStream.mockReturnValue({ pipe });

      const res = buildResponse();
      await controller.photo(fileId, res as never);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Length', 1234);
      expect(pipe).toHaveBeenCalledWith(res);
    });

    it('hides a file no published activity references', async () => {
      activityService.isPublicPhoto.mockResolvedValue(false);

      await expect(
        controller.photo(fileId, buildResponse() as never),
      ).rejects.toBeInstanceOf(NotFoundException);
      // Le depot ne doit pas etre interroge : repondre autre chose que 404
      // revelerait l'existence du fichier.
      expect(uploadService.findPublicById).not.toHaveBeenCalled();
    });

    it('reports a missing file as not found', async () => {
      activityService.isPublicPhoto.mockResolvedValue(true);
      uploadService.findPublicById.mockResolvedValue(null);

      await expect(
        controller.photo(fileId, buildResponse() as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
