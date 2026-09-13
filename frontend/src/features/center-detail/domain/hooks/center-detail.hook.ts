import { useQuery } from '@tanstack/react-query';
import CenterDetailRepositoryImpl from '../../data/repositories/center-detail.repository.impl';

const repository = new CenterDetailRepositoryImpl();

const QUERY_KEYS = {
  detail: (id: string) => ['centers', id] as const,
};

export function useCenterDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });

  return { center: data, centerIsLoading: isLoading, centerError: error };
}
