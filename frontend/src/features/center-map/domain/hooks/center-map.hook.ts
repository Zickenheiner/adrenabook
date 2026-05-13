import { useQuery } from '@tanstack/react-query';
import CenterMapRepositoryImpl from '../../data/repositories/center-map.repository.impl';
import type { CentersMapQueryDto } from '../../data/dtos/center-map.dto';

const repository = new CenterMapRepositoryImpl();

const QUERY_KEYS = {
  map: (query: CentersMapQueryDto) => ['centerMap', query] as const,
};

export function useCenterMap(query: CentersMapQueryDto | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.map(query ?? {}),
    queryFn: () => repository.getMap(query!),
    enabled: query !== null,
  });

  return {
    centersMap: data,
    centersMapIsLoading: isLoading,
    centersMapError: error,
  };
}
