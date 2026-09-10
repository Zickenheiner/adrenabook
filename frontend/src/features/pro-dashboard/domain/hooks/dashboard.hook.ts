import { useQuery } from '@tanstack/react-query';
import DashboardRepositoryImpl from '../../data/repositories/dashboard.repository.impl';
import type { DashboardQueryDto } from '../../data/dtos/dashboard.dto';

const repository = new DashboardRepositoryImpl();

const QUERY_KEYS = {
  dashboard: (query: DashboardQueryDto) => ['pro-dashboard', query] as const,
};

export function useDashboard(query: DashboardQueryDto) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.dashboard(query),
    queryFn: () => repository.get(query),
  });

  return {
    dashboard: data,
    dashboardIsLoading: isLoading,
    dashboardError: error,
  };
}
