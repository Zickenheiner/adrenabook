import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CenterReviewRepositoryImpl from '../../data/repositories/center-review.repository.impl';
import type { ReviewCenterRequestDto } from '../../data/dtos/center-review.dto';

const repository = new CenterReviewRepositoryImpl();

const QUERY_KEYS = {
  pendingCenters: ['admin', 'centers', 'pending'] as const,
};

export function usePendingCenters() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.pendingCenters,
    queryFn: () => repository.getPendingCenters(),
  });

  return {
    pendingCenters: data,
    pendingCentersIsLoading: isLoading,
    pendingCentersError: error,
  };
}

export function useReviewCenter() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewCenterRequestDto }) =>
      repository.reviewCenter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingCenters });
    },
  });

  return {
    reviewCenter: mutate,
    reviewCenterIsPending: isPending,
    reviewCenterError: error,
    reviewCenterIsSuccess: isSuccess,
  };
}
