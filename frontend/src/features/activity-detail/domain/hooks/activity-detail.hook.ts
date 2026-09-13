import { useQuery } from '@tanstack/react-query';
import ActivityDetailRepositoryImpl from '../../data/repositories/activity-detail.repository.impl';

const repository = new ActivityDetailRepositoryImpl();

const QUERY_KEYS = {
  detail: (id: string) => ['activities', id] as const,
  slots: (id: string, month: string) =>
    ['activities', id, 'slots', month] as const,
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

/**
 * Creneaux du mois affiche.
 *
 * Une cle de cache par mois : revenir sur un mois deja consulte est immediat
 * et sans requete, et changer de mois ne recharge que ce mois.
 */
export function useActivitySlots(id: string, month: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.slots(id, month),
    queryFn: () => repository.getSlotsByMonth(id, month),
    enabled: !!id && !!month,
    // Les places restantes evoluent : on les rafraichit a chaque retour.
    staleTime: 30 * 1000,
  });

  return {
    slots: data?.slots ?? [],
    availableMonths: data?.availableMonths ?? [],
    slotsAreLoading: isLoading,
    slotsError: error,
  };
}
