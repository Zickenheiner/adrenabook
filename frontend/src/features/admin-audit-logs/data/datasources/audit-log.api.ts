import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { QueryParams } from '@/core/types/query.type';
import type {
  AuditLogsQueryDto,
  AuditLogsResponseDto,
} from '../dtos/audit-log.dto';

class AuditLogApi {
  constructor(
    private readonly baseUrl: string = endpoints.adminAuditLogs.list,
  ) {}

  async getAll(query?: AuditLogsQueryDto): Promise<AuditLogsResponseDto> {
    const queryParams: QueryParams = {};
    if (query) {
      if (query.actorId !== undefined) queryParams['actorId'] = query.actorId;
      if (query.actionType !== undefined)
        queryParams['actionType'] = query.actionType;
      if (query.from !== undefined) queryParams['from'] = query.from;
      if (query.to !== undefined) queryParams['to'] = query.to;
      if (query.severity !== undefined)
        queryParams['severity'] = query.severity;
      if (query.page !== undefined) queryParams['page'] = query.page;
      if (query.pageSize !== undefined)
        queryParams['pageSize'] = query.pageSize;
    }

    return request<AuditLogsResponseDto>({
      url: this.baseUrl,
      method: methods.GET,
      query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }
}

export default AuditLogApi;
