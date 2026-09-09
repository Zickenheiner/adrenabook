import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CenterService } from './center.service';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';
import {
  CentersMapQueryDto,
  CentersQueryDto,
  CreateCenterDto,
  UpdateCenterDto,
} from '@features/centers/domains/dtos/center.dto';

// Construit une entite centre entierement renseignee via ses setters
const buildCenter = (
  id: string,
  name: string,
  lat: number,
  lng: number,
  activitiesCount = 0,
  city = 'Grenoble',
): CenterEntity => {
  const entity = new CenterEntity(id as never);
  entity.setName(name);
  entity.setLat(lat);
  entity.setLng(lng);
  entity.setCity(city);
  entity.setActivitiesCount(activitiesCount);
  return entity;
};

describe('CenterService', () => {
  let service: CenterService;
  let repository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findByBbox: jest.Mock;
    findByRadius: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByBbox: jest.fn(),
      findByRadius: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CenterService,
        { provide: 'ICenterRepository', useValue: repository },
      ],
    }).compile();

    service = module.get<CenterService>(CenterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('should delegate to the repository', async () => {
      const centers = [buildCenter('a', 'Alpha', 45, 5)];
      repository.findAll.mockResolvedValue(centers);

      await expect(service.findAll()).resolves.toBe(centers);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return null when the repository returns null', async () => {
      repository.findAll.mockResolvedValue(null);

      await expect(service.findAll()).resolves.toBeNull();
    });
  });

  describe('findById()', () => {
    it('should delegate to the repository', async () => {
      const center = buildCenter('a', 'Alpha', 45, 5);
      repository.findById.mockResolvedValue(center);

      await expect(service.findById('a')).resolves.toBe(center);
      expect(repository.findById).toHaveBeenCalledWith('a');
    });

    it('should return null when nothing is found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    it('should delegate to the repository', async () => {
      const dto = { name: 'Alpha', lat: 45, lng: 5 } as CreateCenterDto;
      const center = buildCenter('a', 'Alpha', 45, 5);
      repository.create.mockResolvedValue(center);

      await expect(service.create(dto)).resolves.toBe(center);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate a repository failure', async () => {
      repository.create.mockRejectedValue(new Error('duplicate'));

      await expect(service.create({} as CreateCenterDto)).rejects.toThrow(
        'duplicate',
      );
    });
  });

  describe('update()', () => {
    it('should delegate to the repository', async () => {
      const dto = { name: 'Beta' } as UpdateCenterDto;
      repository.update.mockResolvedValue(true);

      await expect(service.update('a', dto)).resolves.toBe(true);
      expect(repository.update).toHaveBeenCalledWith('a', dto);
    });

    it('should return false when the repository found nothing', async () => {
      repository.update.mockResolvedValue(false);

      await expect(
        service.update('unknown', {} as UpdateCenterDto),
      ).resolves.toBe(false);
    });
  });

  describe('delete()', () => {
    it('should delegate to the repository', async () => {
      repository.delete.mockResolvedValue(true);

      await expect(service.delete('a')).resolves.toBe(true);
      expect(repository.delete).toHaveBeenCalledWith('a');
    });

    it('should return false when the repository found nothing', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.delete('unknown')).resolves.toBe(false);
    });
  });

  describe('getMap()', () => {
    const query = (bbox: string, zoom: number): CentersMapQueryDto =>
      ({ bbox, zoom }) as CentersMapQueryDto;

    it('should throw BadRequestException when the bbox has not exactly 4 parts', async () => {
      await expect(service.getMap(query('5,45,6', 10))).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByBbox).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the bbox contains a non-numeric part', async () => {
      await expect(service.getMap(query('5,45,6,nord', 10))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return the flat list of centers at a high zoom level', async () => {
      repository.findByBbox.mockResolvedValue([
        buildCenter('a', 'Alpha', 45, 5, 3),
        buildCenter('b', 'Beta', 46, 6, 4),
      ]);

      const result = await service.getMap(query('5,45,6,46', 12));

      expect(result.centers).toEqual([
        { id: 'a', name: 'Alpha', lat: 45, lng: 5, activitiesCount: 3 },
        { id: 'b', name: 'Beta', lat: 46, lng: 6, activitiesCount: 4 },
      ]);
    });

    it('should aggregate the centers into a single cluster below the zoom threshold', async () => {
      repository.findByBbox.mockResolvedValue([
        buildCenter('a', 'Alpha', 44, 4, 3),
        buildCenter('b', 'Beta', 46, 6, 5),
      ]);

      const result = await service.getMap(query('4,44,6,46', 7));

      expect(result.centers).toHaveLength(1);
      expect(result.centers[0]).toEqual({
        id: 'a',
        name: '2 centres',
        lat: 45,
        lng: 5,
        activitiesCount: 8,
        cluster: true,
        clusterSize: 2,
      });
    });

    it('should not cluster a single center even below the zoom threshold', async () => {
      repository.findByBbox.mockResolvedValue([
        buildCenter('a', 'Alpha', 45, 5, 2),
      ]);

      const result = await service.getMap(query('4,44,6,46', 3));

      expect(result.centers).toEqual([
        { id: 'a', name: 'Alpha', lat: 45, lng: 5, activitiesCount: 2 },
      ]);
    });

    it('should return an empty list when the repository returns null', async () => {
      repository.findByBbox.mockResolvedValue(null);

      const result = await service.getMap(query('5,45,6,46', 12));

      expect(result.centers).toEqual([]);
    });

    it('should return an empty list when the repository returns no center below the threshold', async () => {
      repository.findByBbox.mockResolvedValue([]);

      const result = await service.getMap(query('5,45,6,46', 2));

      expect(result.centers).toEqual([]);
    });
  });

  describe('getCenters()', () => {
    it('should map every center including its city', async () => {
      repository.findByRadius.mockResolvedValue([
        buildCenter('a', 'Alpha', 45, 5, 3, 'Chamonix'),
      ]);
      const query = { lat: 45, lng: 5, radius: 20 } as CentersQueryDto;

      const result = await service.getCenters(query);

      expect(repository.findByRadius).toHaveBeenCalledWith(query);
      expect(result.centers).toEqual([
        {
          id: 'a',
          name: 'Alpha',
          lat: 45,
          lng: 5,
          city: 'Chamonix',
          activitiesCount: 3,
        },
      ]);
    });

    it('should return an empty list when the repository returns null', async () => {
      repository.findByRadius.mockResolvedValue(null);

      const result = await service.getCenters({} as CentersQueryDto);

      expect(result.centers).toEqual([]);
    });
  });
});
