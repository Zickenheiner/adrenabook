import { Test, TestingModule } from '@nestjs/testing';
import { SensitiveActionLogController } from './sensitive-action-log.controller';
import { ISensitiveActionLogService } from '@features/admin/interfaces/services/sensitive-action-log.iservice';
import {
  AuditLogItemDto,
  AuditLogsQueryDto,
  AuditLogsResponseDto,
} from '@features/admin/domains/dtos/sensitive-action-log.dto';

describe('SensitiveActionLogController', () => {
  let controller: SensitiveActionLogController;
  let sensitiveActionLogService: jest.Mocked<ISensitiveActionLogService>;

  const buildLogItem = (): AuditLogItemDto => ({
    id: '68b4d59919d9b7a94b4fde21',
    timestamp: '2026-05-12T10:00:00.000Z',
    actorId: '68b4d59919d9b7a94b4fde22',
    actorRole: 'admin',
    actionType: 'user.status_changed',
    targetType: 'User',
    targetId: '68b4d59919d9b7a94b4fde23',
    severity: 'warning',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    metadata: { reason: 'spam' },
    integrityHash: 'sha256:abc123',
  });

  beforeEach(async () => {
    const sensitiveActionLogServiceMock: jest.Mocked<ISensitiveActionLogService> =
      {
        findAuditLogs: jest.fn(),
        createLog: jest.fn(),
      };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensitiveActionLogController],
      providers: [
        {
          provide: 'ISensitiveActionLogService',
          useValue: sensitiveActionLogServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SensitiveActionLogController>(
      SensitiveActionLogController,
    );
    sensitiveActionLogService = module.get('ISensitiveActionLogService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAuditLogs()', () => {
    it('should return the paginated logs provided by the service', async () => {
      const expected: AuditLogsResponseDto = {
        items: [buildLogItem()],
        total: 1,
      };
      sensitiveActionLogService.findAuditLogs.mockResolvedValue(expected);

      const query: AuditLogsQueryDto = { page: 1, pageSize: 20 };
      const result = await controller.getAuditLogs(query);

      expect(result).toEqual(expected);
      expect(sensitiveActionLogService.findAuditLogs).toHaveBeenCalledWith(
        query,
      );
    });

    it('should forward every filter untouched to the service', async () => {
      sensitiveActionLogService.findAuditLogs.mockResolvedValue({
        items: [],
        total: 0,
      });

      const query: AuditLogsQueryDto = {
        actorId: 'admin-1',
        actionType: 'center.reviewed',
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-12-31T23:59:59.999Z',
        severity: 'critical',
        page: 3,
        pageSize: 50,
      };
      await controller.getAuditLogs(query);

      expect(sensitiveActionLogService.findAuditLogs).toHaveBeenCalledWith(
        query,
      );
    });

    it('should accept an empty query and let the service apply its defaults', async () => {
      sensitiveActionLogService.findAuditLogs.mockResolvedValue({
        items: [],
        total: 0,
      });

      const result = await controller.getAuditLogs({});

      expect(result).toEqual({ items: [], total: 0 });
      expect(sensitiveActionLogService.findAuditLogs).toHaveBeenCalledWith({});
    });

    it('should propagate errors thrown by the service', async () => {
      sensitiveActionLogService.findAuditLogs.mockRejectedValue(
        new Error('boom'),
      );

      await expect(controller.getAuditLogs({})).rejects.toThrow('boom');
    });
  });
});
