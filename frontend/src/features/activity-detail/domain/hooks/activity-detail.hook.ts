import { useQuery } from '@tanstack/react-query';
import ActivityDetailRepositoryImpl from '../../data/repositories/activity-detail.repository.impl';

const repository = new ActivityDetailRepositoryImpl();

const QUERY_KEYS = {
  detail: (id: string) => ['activities', id] as const,
};

export function useActivityDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });

  return {
    activity: data,
    activityIsLoading: isLoading,
    activityError: error,
  };
}
