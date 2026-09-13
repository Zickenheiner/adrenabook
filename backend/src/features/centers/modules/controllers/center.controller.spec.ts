import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CenterController } from './center.controller';
import { ICenterService } from '@features/centers/interfaces/services/center.iservice';
import {
  CentersListResponseDto,
  CentersMapQueryDto,
  CentersMapResponseDto,
  CentersQueryDto,
} from '@features/centers/domains/dtos/center.dto';

describe('CenterController', () => {
  let controller: CenterController;
  let centerService: jest.Mocked<ICenterService>;

  const centerId = '68b4d59919d9b7a94b4fde21';

  beforeEach(async () => {
    const centerServiceMock: jest.Mocked<ICenterService> = {
      getMap: jest.fn(),
      getCenters: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CenterController],
      providers: [
        {
          provide: 'ICenterService',
          useValue: centerServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CenterController>(CenterController);
    centerService = module.get('ICenterService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMap()', () => {
    const query: CentersMapQueryDto = {
      bbox: '2.2,48.8,2.4,48.9',
      zoom: 10,
    };

    const expected: CentersMapResponseDto = {
      centers: [
        {
          id: centerId,
          name: 'Centre Outdoor Lyon',
          lat: 45.764,
          lng: 4.8357,
          activitiesCount: 3,
        },
      ],
    };

    it('should return the centers contained in the bounding box', async () => {
      centerService.getMap.mockResolvedValue(expected);

      const result = await controller.getMap(query);

      expect(result).toEqual(expected);
      expect(centerService.getMap).toHaveBeenCalledWith(query);
      expect(centerService.getMap).toHaveBeenCalledTimes(1);
    });

    it('should forward the activity type filter untouched', async () => {
      centerService.getMap.mockResolvedValue({ centers: [] });
      const filtered: CentersMapQueryDto = {
        ...query,
        activityType: 'escalade',
      };

      await controller.getMap(filtered);

      expect(centerService.getMap).toHaveBeenCalledWith(filtered);
    });

    it('should return clustered centers as provided by the service', async () => {
      centerService.getMap.mockResolvedValue({
        centers: [
          {
            id: centerId,
            name: 'Cluster',
            lat: 45.7,
            lng: 4.8,
            activitiesCount: 0,
            cluster: true,
            clusterSize: 12,
          },
        ],
      });

      const result = await controller.getMap({ ...query, zoom: 4 });

      expect(result.centers[0].cluster).toBe(true);
      expect(result.centers[0].clusterSize).toBe(12);
    });

    it('should propagate a BadRequestException when the bbox is malformed', async () => {
      centerService.getMap.mockRejectedValue(
        new BadRequestException('BBox malformée'),
      );

      await expect(
        controller.getMap({ bbox: 'nope', zoom: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCenters()', () => {
    const expected: CentersListResponseDto = {
      centers: [
        {
          id: centerId,
          name: 'Centre Outdoor Lyon',
          lat: 45.764,
          lng: 4.8357,
          city: 'Lyon',
          activitiesCount: 5,
        },
      ],
    };

    it('should return the centers matching the query', async () => {
      centerService.getCenters.mockResolvedValue(expected);

      const query: CentersQueryDto = { lat: 45.764, lng: 4.8357, radius: 50 };
      const result = await controller.getCenters(query);

      expect(result).toEqual(expected);
      expect(centerService.getCenters).toHaveBeenCalledWith(query);
    });

    it('should accept an empty query and return every center', async () => {
      centerService.getCenters.mockResolvedValue(expected);

      const result = await controller.getCenters({});

      expect(result.centers).toHaveLength(1);
      expect(centerService.getCenters).toHaveBeenCalledWith({});
    });

    it('should return an empty list when nothing matches', async () => {
      centerService.getCenters.mockResolvedValue({ centers: [] });

      const result = await controller.getCenters({ type: 'unknown' });

      expect(result.centers).toEqual([]);
    });

    it('should propagate a BadRequestException on invalid parameters', async () => {
      centerService.getCenters.mockRejectedValue(
        new BadRequestException('Paramètres invalides'),
      );

      await expect(controller.getCenters({ radius: -1 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
