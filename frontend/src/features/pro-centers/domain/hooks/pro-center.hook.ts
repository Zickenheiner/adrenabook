import { useQuery } from '@tanstack/react-query';
import ProCenterRepositoryImpl from '../../data/repositories/pro-center.repository.impl';

const repository = new ProCenterRepositoryImpl();

const QUERY_KEYS = {
  mine: ['pro-centers'] as const,
};

export function useMyCenters() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.mine,
    queryFn: () => repository.getMine(),
  });

  return {
    centers: data,
    centersIsLoading: isLoading,
    centersError: error,
  };
}
