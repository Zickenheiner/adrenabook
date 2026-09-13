import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ProCenterRepositoryImpl from '../../data/repositories/pro-center.repository.impl';
import type { UpdateCenterRequestDto } from '../../data/dtos/pro-center.dto';

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

export function useDeleteCenter() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mine });
    },
  });

  return {
    deleteCenter: mutate,
    deleteCenterIsPending: isPending,
    deleteCenterError: error,
  };
}

export function useUpdateCenter() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCenterRequestDto }) =>
      repository.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mine });
    },
  });

  return {
    updateCenter: mutate,
    updateCenterIsPending: isPending,
    updateCenterError: error,
  };
}
