import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ActivityRepositoryImpl from '../../data/repositories/activity.repository.impl';
import type { CreateActivityRequestDto } from '../../data/dtos/activity.dto';

const repository = new ActivityRepositoryImpl();

const QUERY_KEYS = {
  all: ['pro-activities'] as const,
  detail: (id: string) => ['pro-activities', id] as const,
};

export function useActivityList() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: () => repository.getAll(),
  });

  return {
    activities: data,
    activitiesIsLoading: isLoading,
    activitiesError: error,
  };
}

export function useActivity(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });

  return { activity: data, activityIsLoading: isLoading, activityError: error };
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: CreateActivityRequestDto) => repository.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  return {
    createActivity: mutate,
    createActivityIsPending: isPending,
    createActivityError: error,
  };
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateActivityRequestDto>;
    }) => repository.update(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
    },
  });

  return {
    updateActivity: mutate,
    updateActivityIsPending: isPending,
    updateActivityError: error,
  };
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  return {
    deleteActivity: mutate,
    deleteActivityIsPending: isPending,
    deleteActivityError: error,
  };
}
