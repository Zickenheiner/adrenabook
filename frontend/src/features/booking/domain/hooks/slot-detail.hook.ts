import { useQuery } from '@tanstack/react-query';
import SlotDetailRepositoryImpl from '../../data/repositories/slot-detail.repository.impl';

const repository = new SlotDetailRepositoryImpl();

const QUERY_KEYS = {
  slot: (id: string) => ['slots', id] as const,
};

export function useSlotDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.slot(id),
    queryFn: () => repository.getById(id),
    enabled: !!id,
    retry: false,
  });

  return {
    slot: data,
    slotIsLoading: isLoading,
    slotError: error,
  };
}
