import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';
import {
  CreateActivityDto,
  SearchActivitiesQueryDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';

const USER_ID = '68b4d59919d9b7a94b4fde21';
const CENTER_ID = '68b4d59919d9b7a94b4fde22';

const buildActivity = (
  id: string,
  status = 'draft',
  createdAt?: Date,
): ActivityEntity => {
  const entity = new ActivityEntity(id as never);
  entity.setStatus(status);
  if (createdAt) {
    entity.setCreatedAt(createdAt);
  }
  return entity;
};

describe('ActivityService', () => {
  let service: ActivityService;
  let repository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findDetailById: jest.Mock;
    findByCenterId: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    search: jest.Mock;
  };
  let centerService: { findByOwnerId: jest.Mock };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findDetailById: jest.fn(),
      findByCenterId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };
    centerService = { findByOwnerId: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: 'IActivityRepository', useValue: repository },
        { provide: 'IProfessionalCenterService', useValue: centerService },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('should delegate to the repository', async () => {
      const activities = [buildActivity('a')];
      repository.findAll.mockResolvedValue(activities);

      await expect(service.findAll()).resolves.toBe(activities);
    });

    it('should return null when the repository returns null', async () => {
      repository.findAll.mockResolvedValue(null);

      await expect(service.findAll()).resolves.toBeNull();
    });
  });

  describe('findById()', () => {
    it('should delegate to the repository', async () => {
      const activity = buildActivity('a');
      repository.findById.mockResolvedValue(activity);

      await expect(service.findById('a')).resolves.toBe(activity);
      expect(repository.findById).toHaveBeenCalledWith('a');
    });

    it('should return null when nothing is found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).resolves.toBeNull();
    });
  });

  describe('findDetailById()', () => {
    it('should delegate to the repository', async () => {
      const detail = { id: 'a' };
      repository.findDetailById.mockResolvedValue(detail);

      await expect(service.findDetailById('a')).resolves.toBe(detail);
      expect(repository.findDetailById).toHaveBeenCalledWith('a');
    });

    it('should return null when nothing is found', async () => {
      repository.findDetailById.mockResolvedValue(null);

      await expect(service.findDetailById('unknown')).resolves.toBeNull();
    });
  });

  describe('findByCenterId()', () => {
    it('should delegate to the repository', async () => {
      repository.findByCenterId.mockResolvedValue([]);

      await expect(service.findByCenterId(CENTER_ID)).resolves.toEqual([]);
      expect(repository.findByCenterId).toHaveBeenCalledWith(CENTER_ID);
    });
  });

  describe('create()', () => {
    const dto = { title: 'Parapente biplace' } as CreateActivityDto;

    const buildCenter = (): ProfessionalCenterEntity =>
      new ProfessionalCenterEntity(CENTER_ID as never);

    it('should return null when the professional owns no center', async () => {
      centerService.findByOwnerId.mockResolvedValue(null);

      await expect(service.create(dto, USER_ID)).resolves.toBeNull();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should attach the activity to the center of the professional', async () => {
      centerService.findByOwnerId.mockResolvedValue(buildCenter());
      repository.create.mockResolvedValue(
        buildActivity(
          'activity-1',
          'draft',
          new Date('2026-03-01T10:00:00.000Z'),
        ),
      );

      const result = await service.create(dto, USER_ID);

      expect(centerService.findByOwnerId).toHaveBeenCalledWith(USER_ID);
      expect(repository.create).toHaveBeenCalledWith(dto, CENTER_ID);
      expect(result).toEqual({
        id: 'activity-1',
        status: 'draft',
        createdAt: '2026-03-01T10:00:00.000Z',
      });
    });

    it('should return null when the repository could not create the activity', async () => {
      centerService.findByOwnerId.mockResolvedValue(buildCenter());
      repository.create.mockResolvedValue(null);

      await expect(service.create(dto, USER_ID)).resolves.toBeNull();
    });

    it('should fall back to the current date when the entity has no creation date', async () => {
      centerService.findByOwnerId.mockResolvedValue(buildCenter());
      repository.create.mockResolvedValue(
        buildActivity('activity-2', 'published'),
      );

      const result = await service.create(dto, USER_ID);

      expect(result?.status).toBe('published');
      expect(Number.isNaN(Date.parse(result!.createdAt))).toBe(false);
    });

    it('should propagate a repository failure', async () => {
      centerService.findByOwnerId.mockResolvedValue(buildCenter());
      repository.create.mockRejectedValue(new Error('validation failed'));

      await expect(service.create(dto, USER_ID)).rejects.toThrow(
        'validation failed',
      );
    });
  });

  describe('update()', () => {
    it('should delegate to the repository', async () => {
      const dto = { title: 'Nouveau titre' } as UpdateActivityDto;
      repository.update.mockResolvedValue(true);

      await expect(service.update('a', dto)).resolves.toBe(true);
      expect(repository.update).toHaveBeenCalledWith('a', dto);
    });

    it('should return false when nothing was updated', async () => {
      repository.update.mockResolvedValue(false);

      await expect(
        service.update('unknown', {} as UpdateActivityDto),
      ).resolves.toBe(false);
    });
  });

  describe('delete()', () => {
    it('should delegate to the repository', async () => {
      repository.delete.mockResolvedValue(true);

      await expect(service.delete('a')).resolves.toBe(true);
      expect(repository.delete).toHaveBeenCalledWith('a');
    });

    it('should return false when nothing was deleted', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.delete('unknown')).resolves.toBe(false);
    });
  });

  describe('search()', () => {
    it('should delegate to the repository', async () => {
      const response = { items: [], total: 0 };
      repository.search.mockResolvedValue(response);
      const query = { q: 'parapente' } as SearchActivitiesQueryDto;

      await expect(service.search(query)).resolves.toBe(response);
      expect(repository.search).toHaveBeenCalledWith(query);
    });

    it('should propagate a repository failure', async () => {
      repository.search.mockRejectedValue(new Error('index missing'));

      await expect(
        service.search({} as SearchActivitiesQueryDto),
      ).rejects.toThrow('index missing');
    });
  });
});
