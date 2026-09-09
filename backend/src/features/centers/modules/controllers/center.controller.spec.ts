import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CenterController } from './center.controller';
import { ICenterService } from '@features/centers/interfaces/services/center.iservice';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';
import {
  CentersListResponseDto,
  CentersMapQueryDto,
  CentersMapResponseDto,
  CentersQueryDto,
  CreateCenterDto,
  UpdateCenterDto,
} from '@features/centers/domains/dtos/center.dto';

describe('CenterController', () => {
  let controller: CenterController;
  let centerService: jest.Mocked<ICenterService>;

  const centerId = '68b4d59919d9b7a94b4fde21';

  beforeEach(async () => {
    const centerServiceMock: jest.Mocked<ICenterService> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

  describe('findById()', () => {
    it('should return the center with the given id', async () => {
      const entity = new CenterEntity(centerId as never);
      centerService.findById.mockResolvedValue(entity);

      const result = await controller.findById(centerId);

      expect(result).toBe(entity);
      expect(centerService.findById).toHaveBeenCalledWith(centerId);
    });

    it('should return null when the service finds nothing', async () => {
      centerService.findById.mockResolvedValue(null);

      await expect(controller.findById('unknown')).resolves.toBeNull();
    });

    it('should propagate a NotFoundException raised by the service', async () => {
      centerService.findById.mockRejectedValue(
        new NotFoundException('Centre introuvable'),
      );

      await expect(controller.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create()', () => {
    const dto: CreateCenterDto = {
      name: 'Centre Outdoor Lyon',
      lat: 45.764,
      lng: 4.8357,
      city: 'Lyon',
      activityTypes: ['escalade'],
      activitiesCount: 5,
    };

    it('should create the center and return it', async () => {
      const entity = new CenterEntity(centerId as never);
      centerService.create.mockResolvedValue(entity);

      const result = await controller.create(dto);

      expect(result).toBe(entity);
      expect(centerService.create).toHaveBeenCalledWith(dto);
    });

    it('should return null when the creation yields nothing', async () => {
      centerService.create.mockResolvedValue(null);

      await expect(controller.create(dto)).resolves.toBeNull();
    });

    it('should propagate a BadRequestException on invalid payload', async () => {
      centerService.create.mockRejectedValue(
        new BadRequestException('Données invalides'),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update()', () => {
    const dto: UpdateCenterDto = { name: 'Nouveau nom' };

    it('should update the center and return true', async () => {
      centerService.update.mockResolvedValue(true);

      const result = await controller.update(centerId, dto);

      expect(result).toBe(true);
      expect(centerService.update).toHaveBeenCalledWith(centerId, dto);
    });

    it('should return false when no center was updated', async () => {
      centerService.update.mockResolvedValue(false);

      await expect(controller.update('unknown', dto)).resolves.toBe(false);
    });

    it('should propagate a NotFoundException raised by the service', async () => {
      centerService.update.mockRejectedValue(
        new NotFoundException('Centre introuvable'),
      );

      await expect(controller.update('unknown', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete()', () => {
    it('should delete the center and return true', async () => {
      centerService.delete.mockResolvedValue(true);

      const result = await controller.delete(centerId);

      expect(result).toBe(true);
      expect(centerService.delete).toHaveBeenCalledWith(centerId);
    });

    it('should return false when no center was deleted', async () => {
      centerService.delete.mockResolvedValue(false);

      await expect(controller.delete('unknown')).resolves.toBe(false);
    });

    it('should propagate a NotFoundException raised by the service', async () => {
      centerService.delete.mockRejectedValue(
        new NotFoundException('Centre introuvable'),
      );

      await expect(controller.delete('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
