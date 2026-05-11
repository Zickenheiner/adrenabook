import { useQuery } from '@tanstack/react-query';
import ActivitySearchRepositoryImpl from '../../data/repositories/activity-search.repository.impl';
import type { ActivitySearchParamsEntity } from '../entities/activity-search.entity';

const repository = new ActivitySearchRepositoryImpl();

const QUERY_KEYS = {
  search: (params: ActivitySearchParamsEntity) =>
    ['activity-search', params] as const,
};

export function useActivitySearch(params: ActivitySearchParamsEntity) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.search(params),
    queryFn: () => repository.search(params),
  });

  return {
    searchResult: data,
    searchIsLoading: isLoading,
    searchError: error,
  };
}
