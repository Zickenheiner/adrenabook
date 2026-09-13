import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SlotRepositoryImpl from '../../data/repositories/slot.repository.impl';
import type {
  CreateSlotRequestDto,
  UpdateSlotRequestDto,
} from '../../data/dtos/slot.dto';

const repository = new SlotRepositoryImpl();

const QUERY_KEYS = {
  /** Prefixe commun : invalider sans mois vide le cache de tous les mois. */
  allSlots: (activityId: string) => ['pro-slots', activityId] as const,
  slots: (activityId: string, month: string) =>
    ['pro-slots', activityId, month] as const,
};

/**
 * Creneaux du mois affiche.
 *
 * Une cle de cache par mois : changer de mois ne recharge que ce mois, et y
 * revenir est immediat.
 */
export function useProSlots(activityId: string, month: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.slots(activityId, month),
    queryFn: () => repository.listSlots(activityId, month),
    enabled: !!activityId && !!month,
    retry: false,
  });

  return {
    slots: data?.slots ?? [],
    availableMonths: data?.availableMonths ?? [],
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
      // Une recurrence peut deposer des creneaux sur plusieurs mois : on
      // invalide tous les mois de cette activite, pas seulement l'affiche.
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allSlots(activityId),
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

/**
 * Modification et suppression d'un creneau.
 *
 * Toute ecriture invalide l'ensemble des mois de l'activite : un creneau
 * deplace change de mois, et disparaitrait autrement des deux caches.
 */
export function useSlotMutations(activityId: string) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.allSlots(activityId),
    });

  const update = useMutation({
    mutationFn: ({
      slotId,
      data,
    }: {
      slotId: string;
      data: UpdateSlotRequestDto;
    }) => repository.updateSlot(activityId, slotId, data),
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: (slotId: string) => repository.deleteSlot(activityId, slotId),
    onSuccess: () => void invalidate(),
  });

  return {
    updateSlot: update.mutate,
    updateSlotIsPending: update.isPending,
    updateSlotError: update.error,
    resetUpdateSlot: update.reset,
    deleteSlot: remove.mutate,
    deleteSlotIsPending: remove.isPending,
    deleteSlotError: remove.error,
  };
}
