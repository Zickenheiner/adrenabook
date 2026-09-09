import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SlotRepositoryImpl from '../../data/repositories/slot.repository.impl';
import type { CreateSlotRequestDto } from '../../data/dtos/slot.dto';

const repository = new SlotRepositoryImpl();

const QUERY_KEYS = {
  slots: (activityId: string) => ['pro-slots', activityId] as const,
};

export function useProSlots(activityId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.slots(activityId),
    queryFn: () => repository.listSlots(activityId),
    enabled: !!activityId,
    retry: false,
  });

  return {
    slots: data,
    slotsIsLoading: isLoading,
    slotsError: error,
  };
}

export function useCreateSlots(activityId: string) {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error, data } = useMutation({
    mutationFn: (payload: CreateSlotRequestDto) =>
      repository.createSlots(activityId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.slots(activityId),
      });
    },
  });

  return {
    createSlots: mutate,
    createSlotsAsync: mutateAsync,
    createSlotsIsPending: isPending,
    createSlotsError: error,
    createSlotsResult: data,
  };
}
