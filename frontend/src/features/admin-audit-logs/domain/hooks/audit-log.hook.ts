import { useQuery } from '@tanstack/react-query';
import AuditLogRepositoryImpl from '../../data/repositories/audit-log.repository.impl';
import type { AuditLogsQueryDto } from '../../data/dtos/audit-log.dto';

const repository = new AuditLogRepositoryImpl();

const QUERY_KEYS = {
  all: (query?: AuditLogsQueryDto) => ['auditLogs', query] as const,
};

export function useAuditLogs(query?: AuditLogsQueryDto) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.all(query),
    queryFn: () => repository.getAll(query),
    retry: false,
  });

  return {
    auditLogs: data,
    auditLogsIsLoading: isLoading,
    auditLogsError: error,
  };
}
