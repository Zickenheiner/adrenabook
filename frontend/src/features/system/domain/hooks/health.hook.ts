import { useQuery } from '@tanstack/react-query';
import HealthRepositoryImpl from '../../data/repositories/health.repository.impl';

const repository = new HealthRepositoryImpl();

const HEALTH_REFRESH_INTERVAL_MS = 15_000;

const QUERY_KEYS = {
  health: ['system', 'health'] as const,
};

export function useHealth() {
  const {
    data,
    isLoading,
    isFetching,
    isRefetching,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: () => repository.getHealth(),
    refetchInterval: HEALTH_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  return {
    health: data,
    healthIsLoading: isLoading,
    healthIsFetching: isFetching,
    healthIsRefetching: isRefetching,
    healthError: error,
    healthRefetch: refetch,
    healthUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : undefined,
  };
}
