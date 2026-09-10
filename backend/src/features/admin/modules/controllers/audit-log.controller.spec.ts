import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminUserStatusController } from './audit-log.controller';
import { IAdminUserStatusService } from '@features/admin/interfaces/services/admin-user-status.iservice';
import {
  UpdateUserStatusDto,
  UpdateUserStatusResponseDto,
} from '@features/admin/domains/dtos/update-user-status.dto';
import {
  ADMIN_USERS_DEFAULT_LIMIT,
  ADMIN_USERS_MAX_LIMIT,
  AdminUserListItemDto,
  AdminUserListResponseDto,
} from '@features/admin/domains/dtos/admin-user-list.dto';

describe('AdminUserStatusController', () => {
  let controller: AdminUserStatusController;
  let adminUserStatusService: jest.Mocked<IAdminUserStatusService>;

  const buildListItem = (): AdminUserListItemDto => ({
    id: '68b4d59919d9b7a94b4fde21',
    email: 'marie.dupont@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'aventurier',
    status: 'active',
    createdAt: '2026-08-19T21:51:00.000Z',
  });

  const buildListResponse = (): AdminUserListResponseDto => ({
    data: [buildListItem()],
    meta: {
      total: 1,
      page: 1,
      limit: ADMIN_USERS_DEFAULT_LIMIT,
      totalPages: 1,
    },
  });

  beforeEach(async () => {
    const adminUserStatusServiceMock: jest.Mocked<IAdminUserStatusService> = {
      updateUserStatus: jest.fn(),
      listUsers: jest.fn(),
      getUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserStatusController],
      providers: [
        {
          provide: 'IAdminUserStatusService',
          useValue: adminUserStatusServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AdminUserStatusController>(
      AdminUserStatusController,
    );
    adminUserStatusService = module.get('IAdminUserStatusService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateUserStatus()', () => {
    const dto: UpdateUserStatusDto = {
      status: 'suspended',
      reason: 'Multiple violations of terms of service',
      durationDays: 7,
    };

    it('should forward the id, the dto and the authenticated admin to the service', async () => {
      const expected: UpdateUserStatusResponseDto = {
        userId: 'user-1',
        previousStatus: 'active',
        newStatus: 'suspended',
        effectiveUntil: '2026-05-19T00:00:00.000Z',
        auditLogId: 'audit-1',
      };
      adminUserStatusService.updateUserStatus.mockResolvedValue(expected);

      const result = await controller.updateUserStatus('user-1', dto, {
        user: { sub: 'admin-1', role: 'admin' },
      });

      expect(result).toEqual(expected);
      expect(adminUserStatusService.updateUserStatus).toHaveBeenCalledWith(
        'user-1',
        dto,
        'admin-1',
        'admin',
      );
    });

    it('should fall back to the "unknown" role when the JWT payload carries none', async () => {
      adminUserStatusService.updateUserStatus.mockResolvedValue(
        {} as UpdateUserStatusResponseDto,
      );

      await controller.updateUserStatus('user-1', dto, {
        user: { sub: 'admin-1' },
      });

      expect(adminUserStatusService.updateUserStatus).toHaveBeenCalledWith(
        'user-1',
        dto,
        'admin-1',
        'unknown',
      );
    });

    it('should propagate a NotFoundException raised by the service', async () => {
      adminUserStatusService.updateUserStatus.mockRejectedValue(
        new NotFoundException('User with id user-1 not found'),
      );

      await expect(
        controller.updateUserStatus('user-1', dto, {
          user: { sub: 'admin-1', role: 'admin' },
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('list()', () => {
    it('should apply the default page and limit when the query is empty', async () => {
      adminUserStatusService.listUsers.mockResolvedValue(buildListResponse());

      const result = await controller.list({});

      expect(result).toEqual(buildListResponse());
      expect(adminUserStatusService.listUsers).toHaveBeenCalledWith(
        1,
        ADMIN_USERS_DEFAULT_LIMIT,
      );
    });

    it('should forward the requested page and limit', async () => {
      adminUserStatusService.listUsers.mockResolvedValue(buildListResponse());

      await controller.list({ page: 3, limit: 5 });

      expect(adminUserStatusService.listUsers).toHaveBeenCalledWith(3, 5);
    });

    it('should cap the limit to the maximum allowed value', async () => {
      adminUserStatusService.listUsers.mockResolvedValue(buildListResponse());

      await controller.list({ page: 1, limit: 5000 });

      expect(adminUserStatusService.listUsers).toHaveBeenCalledWith(
        1,
        ADMIN_USERS_MAX_LIMIT,
      );
    });

    it('should propagate errors thrown by the service', async () => {
      adminUserStatusService.listUsers.mockRejectedValue(new Error('boom'));

      await expect(controller.list({})).rejects.toThrow('boom');
    });
  });

  describe('getOne()', () => {
    it('should return the account matching the given id', async () => {
      const item = buildListItem();
      adminUserStatusService.getUser.mockResolvedValue(item);

      const result = await controller.getOne(item.id);

      expect(result).toEqual(item);
      expect(adminUserStatusService.getUser).toHaveBeenCalledWith(item.id);
    });

    it('should propagate a NotFoundException for an unknown account', async () => {
      adminUserStatusService.getUser.mockRejectedValue(
        new NotFoundException('Compte introuvable'),
      );

      await expect(controller.getOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
