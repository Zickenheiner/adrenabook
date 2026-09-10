import { useMutation } from '@tanstack/react-query';
import PasswordResetRequestRepositoryImpl from '../../data/repositories/password-reset-request.repository.impl';
import type { PasswordResetRequestRequestDto } from '../../data/dtos/password-reset-request.dto';
import type { PasswordResetRequestEntity } from '../entities/password-reset-request.entity';

const repository = new PasswordResetRequestRepositoryImpl();

const MUTATION_KEYS = {
  passwordResetRequest: ['auth', 'password-reset', 'request'] as const,
};

export function usePasswordResetRequest() {
  const {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  } = useMutation<
    PasswordResetRequestEntity,
    Error,
    PasswordResetRequestRequestDto
  >({
    mutationKey: MUTATION_KEYS.passwordResetRequest,
    mutationFn: (payload: PasswordResetRequestRequestDto) =>
      repository.request(payload),
  });

  return {
    passwordResetRequest: mutate,
    passwordResetRequestAsync: mutateAsync,
    passwordResetRequestIsLoading: isPending,
    passwordResetRequestIsSuccess: isSuccess,
    passwordResetRequestIsError: isError,
    passwordResetRequestError: error,
    passwordResetRequestData: data,
    passwordResetRequestReset: reset,
  };
}
