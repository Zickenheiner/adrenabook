import { useQuery } from '@tanstack/react-query';
import DashboardRepositoryImpl from '../../data/repositories/dashboard.repository.impl';

const repository = new DashboardRepositoryImpl();

const QUERY_KEYS = {
  dashboard: ['adventurer-dashboard'] as const,
};

export function useDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: () => repository.getDashboard(),
  });

  return {
    dashboard: data,
    dashboardIsLoading: isLoading,
    dashboardError: error,
  };
}
