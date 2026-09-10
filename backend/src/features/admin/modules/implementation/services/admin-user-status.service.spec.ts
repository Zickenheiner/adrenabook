import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { AdminUserStatusService } from './admin-user-status.service';
import { User, UserDocument } from '@features/auth/domains/schemas/user.schema';
import { UserEntity } from '@features/auth/domains/entities/user.entity';
import { AuditLogEntity } from '@features/admin/domains/entities/audit-log.entity';
import { SensitiveActionLogEntity } from '@features/admin/domains/entities/sensitive-action-log.entity';
import { UpdateUserStatusDto } from '@features/admin/domains/dtos/update-user-status.dto';

describe('AdminUserStatusService', () => {
  const USER_ID = '68b4d59919d9b7a94b4fde21';
  const ADMIN_ID = '68b4d59919d9b7a94b4fde22';

  let service: AdminUserStatusService;
  let userService: { findById: jest.Mock };
  let userRepository: { updateStatus: jest.Mock };
  let auditLogService: { createLog: jest.Mock };
  let sensitiveActionLogService: { createLog: jest.Mock };
  let userModel: {
    find: jest.Mock;
    countDocuments: jest.Mock;
    findById: jest.Mock;
  };
  let findChain: {
    sort: jest.Mock;
    skip: jest.Mock;
    limit: jest.Mock;
    exec: jest.Mock;
  };

  const buildUserDoc = (
    overrides: Partial<Record<string, unknown>> = {},
  ): UserDocument =>
    ({
      _id: USER_ID,
      email: 'marie.dupont@example.com',
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'Aventurier',
      status: 'active',
      createdAt: new Date('2026-08-19T21:51:00.000Z'),
      ...overrides,
    }) as unknown as UserDocument;

  const buildUserEntity = (status?: string): UserEntity =>
    ({
      getStatus: jest.fn().mockReturnValue(status),
    }) as unknown as UserEntity;

  const buildAuditLog = (id = 'audit-1'): AuditLogEntity =>
    ({
      getId: jest.fn().mockReturnValue(id),
    }) as unknown as AuditLogEntity;

  beforeEach(async () => {
    findChain = {
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
      exec: jest.fn().mockResolvedValue([]),
    };
    findChain.sort.mockReturnValue(findChain);
    findChain.skip.mockReturnValue(findChain);
    findChain.limit.mockReturnValue(findChain);

    userModel = {
      find: jest.fn().mockReturnValue(findChain),
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };

    const userServiceMock = { findById: jest.fn() };
    const userRepositoryMock = {
      updateStatus: jest.fn().mockResolvedValue(true),
    };
    const auditLogServiceMock = {
      createLog: jest.fn().mockResolvedValue(buildAuditLog()),
    };
    const sensitiveActionLogServiceMock = {
      createLog: jest.fn().mockResolvedValue({} as SensitiveActionLogEntity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserStatusService,
        { provide: 'IUserService', useValue: userServiceMock },
        { provide: 'IUserRepository', useValue: userRepositoryMock },
        { provide: 'IAuditLogService', useValue: auditLogServiceMock },
        {
          provide: 'ISensitiveActionLogService',
          useValue: sensitiveActionLogServiceMock,
        },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = module.get<AdminUserStatusService>(AdminUserStatusService);
    userService = module.get('IUserService');
    userRepository = module.get('IUserRepository');
    auditLogService = module.get('IAuditLogService');
    sensitiveActionLogService = module.get('ISensitiveActionLogService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listUsers()', () => {
    it('should return the projected accounts with their pagination metadata', async () => {
      findChain.exec.mockResolvedValue([buildUserDoc()]);
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(42),
      });

      const result = await service.listUsers(1, 20);

      expect(result).toEqual({
        data: [
          {
            id: USER_ID,
            email: 'marie.dupont@example.com',
            firstName: 'Marie',
            lastName: 'Dupont',
            role: 'aventurier',
            status: 'active',
            createdAt: '2026-08-19T21:51:00.000Z',
          },
        ],
        meta: { total: 42, page: 1, limit: 20, totalPages: 3 },
      });
    });

    it('should sort by creation date descending and apply the pagination window', async () => {
      await service.listUsers(3, 10);

      expect(userModel.find).toHaveBeenCalled();
      expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(findChain.skip).toHaveBeenCalledWith(20);
      expect(findChain.limit).toHaveBeenCalledWith(10);
    });

    it('should never expose a secret field of the user document', async () => {
      findChain.exec.mockResolvedValue([
        buildUserDoc({
          password: 'hashed',
          refreshTokenHash: 'hash',
          emailVerificationToken: 'token',
        }),
      ]);
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.listUsers(1, 20);

      expect(result.data[0]).not.toHaveProperty('password');
      expect(result.data[0]).not.toHaveProperty('refreshTokenHash');
      expect(result.data[0]).not.toHaveProperty('emailVerificationToken');
    });

    it('should default the role, the status and the creation date when missing', async () => {
      findChain.exec.mockResolvedValue([
        buildUserDoc({
          role: undefined,
          status: undefined,
          createdAt: undefined,
        }),
      ]);
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.listUsers(1, 20);

      expect(result.data[0].role).toBe('');
      expect(result.data[0].status).toBe('active');
      expect(result.data[0].createdAt).toBe('');
    });

    it('should report zero pages when the limit is zero', async () => {
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await service.listUsers(1, 0);

      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe('getUser()', () => {
    it('should return the projected account matching the given id', async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(buildUserDoc()),
      });

      const result = await service.getUser(USER_ID);

      expect(userModel.findById).toHaveBeenCalledWith(USER_ID);
      expect(result.id).toBe(USER_ID);
      expect(result.role).toBe('aventurier');
    });

    it('should throw NotFoundException when the account does not exist', async () => {
      await expect(service.getUser('missing')).rejects.toThrow(
        new NotFoundException('Compte introuvable'),
      );
    });
  });

  describe('updateUserStatus()', () => {
    const suspendDto: UpdateUserStatusDto = {
      status: 'suspended',
      reason: 'Multiple violations of terms of service',
      durationDays: 7,
    };

    it('should update the status, write both logs and return the summary', async () => {
      userService.findById.mockResolvedValue(buildUserEntity('active'));

      const result = await service.updateUserStatus(
        USER_ID,
        suspendDto,
        ADMIN_ID,
        'admin',
      );

      expect(userRepository.updateStatus).toHaveBeenCalledWith(
        USER_ID,
        'suspended',
      );
      expect(result).toEqual({
        userId: USER_ID,
        previousStatus: 'active',
        newStatus: 'suspended',
        effectiveUntil: expect.any(String),
        auditLogId: 'audit-1',
      });
    });

    it('should compute the suspension end date from the requested duration', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-12T00:00:00.000Z'));
      userService.findById.mockResolvedValue(buildUserEntity('active'));

      const result = await service.updateUserStatus(
        USER_ID,
        suspendDto,
        ADMIN_ID,
        'admin',
      );

      expect(result.effectiveUntil).toBe('2026-05-19T00:00:00.000Z');
      jest.useRealTimers();
    });

    it('should leave the end date undefined when no duration is provided', async () => {
      userService.findById.mockResolvedValue(buildUserEntity('active'));

      const result = await service.updateUserStatus(
        USER_ID,
        { status: 'suspended', reason: 'spam' },
        ADMIN_ID,
        'admin',
      );

      expect(result.effectiveUntil).toBeUndefined();
      expect(auditLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ effectiveUntil: undefined }),
      );
    });

    it('should leave the end date undefined for a ban even with a duration', async () => {
      userService.findById.mockResolvedValue(buildUserEntity('active'));

      const result = await service.updateUserStatus(
        USER_ID,
        { status: 'banned', reason: 'fraud', durationDays: 30 },
        ADMIN_ID,
        'admin',
      );

      expect(result.effectiveUntil).toBeUndefined();
    });

    it('should record an audit log entry describing the change', async () => {
      userService.findById.mockResolvedValue(buildUserEntity('active'));

      await service.updateUserStatus(USER_ID, suspendDto, ADMIN_ID, 'admin');

      expect(auditLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          targetUserId: USER_ID,
          adminId: ADMIN_ID,
          previousStatus: 'active',
          newStatus: 'suspended',
          reason: suspendDto.reason,
          durationDays: 7,
        }),
      );
    });

    it('should log a "warning" severity when the account is restricted', async () => {
      userService.findById.mockResolvedValue(buildUserEntity('active'));

      await service.updateUserStatus(USER_ID, suspendDto, ADMIN_ID, 'admin');

      expect(sensitiveActionLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: ADMIN_ID,
          actorRole: 'admin',
          actionType: 'user.status_changed',
          targetType: 'User',
          targetId: USER_ID,
          severity: 'warning',
        }),
      );
    });

    it('should log an "info" severity when the account is reactivated', async () => {
      userService.findById.mockResolvedValue(buildUserEntity('suspended'));

      const result = await service.updateUserStatus(
        USER_ID,
        { status: 'active', reason: 'appeal accepted' },
        ADMIN_ID,
        'admin',
      );

      expect(result.previousStatus).toBe('suspended');
      expect(sensitiveActionLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'info' }),
      );
    });

    it('should carry the audit log id into the sensitive action log metadata', async () => {
      userService.findById.mockResolvedValue(buildUserEntity('active'));
      auditLogService.createLog.mockResolvedValue(buildAuditLog('audit-99'));

      await service.updateUserStatus(
        USER_ID,
        { status: 'banned', reason: 'fraud' },
        ADMIN_ID,
        'admin',
      );

      expect(sensitiveActionLogService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            previousStatus: 'active',
            newStatus: 'banned',
            reason: 'fraud',
            durationDays: undefined,
            effectiveUntil: undefined,
            auditLogId: 'audit-99',
          },
        }),
      );
    });

    it('should fall back to the "active" previous status when the user carries none', async () => {
      userService.findById.mockResolvedValue(buildUserEntity(undefined));

      const result = await service.updateUserStatus(
        USER_ID,
        suspendDto,
        ADMIN_ID,
        'admin',
      );

      expect(result.previousStatus).toBe('active');
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(
        service.updateUserStatus(USER_ID, suspendDto, ADMIN_ID, 'admin'),
      ).rejects.toThrow(
        new NotFoundException(`User with id ${USER_ID} not found`),
      );
      expect(userRepository.updateStatus).not.toHaveBeenCalled();
      expect(auditLogService.createLog).not.toHaveBeenCalled();
    });

    it('should propagate an error raised while persisting the new status', async () => {
      userService.findById.mockResolvedValue(buildUserEntity('active'));
      userRepository.updateStatus.mockRejectedValue(new Error('db down'));

      await expect(
        service.updateUserStatus(USER_ID, suspendDto, ADMIN_ID, 'admin'),
      ).rejects.toThrow('db down');
      expect(auditLogService.createLog).not.toHaveBeenCalled();
    });
  });
});
