import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';
import {
  ActivityResponseDto,
  CreateActivityDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';

const USER_ID = '68b4d59919d9b7a94b4fde21';

const buildActivity = (id: string): ActivityEntity =>
  new ActivityEntity(id as never);

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findDetailById: jest.Mock;
    findByCenterId: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    search: jest.Mock;
  };

  beforeEach(async () => {
    service = {
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
      controllers: [ActivityController],
      providers: [{ provide: 'IActivityService', useValue: service }],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    const dto = { title: 'Parapente biplace' } as CreateActivityDto;
    const proRequest = { user: { sub: USER_ID, role: 'professionnel' } };

    it('should create the activity for an authenticated professional', async () => {
      const response: ActivityResponseDto = {
        id: 'activity-1',
        status: 'draft',
        createdAt: '2026-03-01T10:00:00.000Z',
      };
      service.create.mockResolvedValue(response);

      const result = await controller.create(dto, proRequest);

      expect(service.create).toHaveBeenCalledWith(dto, USER_ID);
      expect(result).toBe(response);
    });

    it('should throw ForbiddenException for a non-professional role', async () => {
      await expect(
        controller.create(dto, { user: { sub: USER_ID, role: 'client' } }),
      ).rejects.toThrow(ForbiddenException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when the request carries no user', async () => {
      await expect(
        controller.create(dto, {} as { user: { sub: string; role: string } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when the service returns null', async () => {
      service.create.mockResolvedValue(null);

      await expect(controller.create(dto, proRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should propagate a service failure', async () => {
      service.create.mockRejectedValue(new Error('validation failed'));

      await expect(controller.create(dto, proRequest)).rejects.toThrow(
        'validation failed',
      );
    });
  });

  describe('findMine()', () => {
    it('should list the activities of the authenticated center', async () => {
      const activities = [buildActivity('a')];
      service.findByCenterId.mockResolvedValue(activities);

      const result = await controller.findMine({ user: { sub: USER_ID } });

      expect(service.findByCenterId).toHaveBeenCalledWith(USER_ID);
      expect(result).toBe(activities);
    });

    it('should return null when the service returns null', async () => {
      service.findByCenterId.mockResolvedValue(null);

      await expect(
        controller.findMine({ user: { sub: USER_ID } }),
      ).resolves.toBeNull();
    });
  });

  describe('findAll()', () => {
    it('should return every activity', async () => {
      const activities = [buildActivity('a'), buildActivity('b')];
      service.findAll.mockResolvedValue(activities);

      await expect(controller.findAll()).resolves.toBe(activities);
    });

    it('should return null when the service returns null', async () => {
      service.findAll.mockResolvedValue(null);

      await expect(controller.findAll()).resolves.toBeNull();
    });
  });

  describe('findById()', () => {
    it('should return the requested activity', async () => {
      const activity = buildActivity('activity-1');
      service.findById.mockResolvedValue(activity);

      const result = await controller.findById('activity-1');

      expect(service.findById).toHaveBeenCalledWith('activity-1');
      expect(result).toBe(activity);
    });

    it('should throw NotFoundException when the activity does not exist', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should delegate to the service', async () => {
      const dto = { title: 'Nouveau titre' } as UpdateActivityDto;
      service.update.mockResolvedValue(true);

      await expect(controller.update('activity-1', dto)).resolves.toBe(true);
      expect(service.update).toHaveBeenCalledWith('activity-1', dto);
    });

    it('should return false when nothing was updated', async () => {
      service.update.mockResolvedValue(false);

      await expect(
        controller.update('unknown', {} as UpdateActivityDto),
      ).resolves.toBe(false);
    });
  });

  describe('delete()', () => {
    it('should delegate to the service', async () => {
      service.delete.mockResolvedValue(true);

      await expect(controller.delete('activity-1')).resolves.toBe(true);
      expect(service.delete).toHaveBeenCalledWith('activity-1');
    });

    it('should return false when nothing was deleted', async () => {
      service.delete.mockResolvedValue(false);

      await expect(controller.delete('unknown')).resolves.toBe(false);
    });
  });
});
