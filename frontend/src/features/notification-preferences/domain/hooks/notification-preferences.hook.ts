import { useMutation, useQueryClient } from '@tanstack/react-query';
import NotificationPreferencesRepositoryImpl from '../../data/repositories/notification-preferences.repository.impl';
import type { NotificationPreferencesRequestDto } from '../../data/dtos/notification-preferences.dto';

const repository = new NotificationPreferencesRepositoryImpl();

const QUERY_KEYS = {
  all: ['notification-preferences'] as const,
};

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (data: NotificationPreferencesRequestDto) =>
      repository.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  return {
    updatePreferences: mutate,
    updatePreferencesIsPending: isPending,
    updatePreferencesIsSuccess: isSuccess,
    updatePreferencesError: error,
  };
}
