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

  const activityId = '68b4d59919d9b7a94b4fde21';

  beforeEach(async () => {
    const activityServiceMock: jest.Mocked<IActivityService> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findDetailById: jest.fn(),
      findByCenterId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitySearchController],
      providers: [
        {
          provide: 'IActivityService',
          useValue: activityServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ActivitySearchController>(ActivitySearchController);
    activityService = module.get('IActivityService');
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
          priceFromEur: 150,
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

  describe('findDetail()', () => {
    const detail: ActivityDetailResponseDto = {
      id: activityId,
      title: 'Parachute en tandem',
      description: 'Saut en parachute en tandem avec un instructeur certifié',
      type: 'paragliding',
      difficulty: 'beginner',
      durationMinutes: 60,
      priceFromEur: 150,
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
      upcomingSlots: [
        {
          id: '68b4d59919d9b7a94b4fde23',
          startAt: '2026-06-15T09:00:00.000Z',
          remainingSeats: 5,
          priceEur: 150,
        },
      ],
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
});
