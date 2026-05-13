import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminUserRepositoryImpl from '../../data/repositories/admin-user.repository.impl';
import type { UpdateUserStatusRequestDto } from '../../data/dtos/admin-user.dto';

const repository = new AdminUserRepositoryImpl();

const QUERY_KEYS = {
  users: (page: number, limit: number) =>
    ['admin', 'users', page, limit] as const,
};

export function useAdminUsers(page: number = 1, limit: number = 20) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.users(page, limit),
    queryFn: () => repository.getUsers(page, limit),
    retry: false,
  });

  return {
    adminUsers: data,
    adminUsersIsLoading: isLoading,
    adminUsersError: error,
  };
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserStatusRequestDto;
    }) => repository.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return {
    updateUserStatus: mutate,
    updateUserStatusIsPending: isPending,
    updateUserStatusError: error,
    updateUserStatusIsSuccess: isSuccess,
  };
}
