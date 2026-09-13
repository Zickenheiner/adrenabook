import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ActivityRepositoryImpl from '../../data/repositories/activity.repository.impl';
import type {
  CreateActivityRequestDto,
  UpdateActivityRequestDto,
} from '../../data/dtos/activity.dto';

const repository = new ActivityRepositoryImpl();

const QUERY_KEYS = {
  all: (centerId: string) => ['pro-activities', centerId] as const,
  detail: (id: string) => ['pro-activities', id] as const,
};

export function useActivityList(centerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.all(centerId),
    queryFn: () => repository.getAll(centerId),
    enabled: !!centerId,
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

export function useCreateActivity(centerId: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: CreateActivityRequestDto) =>
      repository.create(data, centerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all(centerId),
      });
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
      data: UpdateActivityRequestDto;
    }) => repository.update(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['pro-activities'] });
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
      void queryClient.invalidateQueries({ queryKey: ['pro-activities'] });
    },
  });

  return {
    deleteActivity: mutate,
    deleteActivityIsPending: isPending,
    deleteActivityError: error,
  };
}
