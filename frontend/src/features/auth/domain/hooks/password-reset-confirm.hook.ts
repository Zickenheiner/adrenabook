import { useMutation } from '@tanstack/react-query';
import PasswordResetConfirmRepositoryImpl from '../../data/repositories/password-reset-confirm.repository.impl';
import { clearTokens } from '@/core/local/storage';
import type { PasswordResetConfirmRequestDto } from '../../data/dtos/password-reset-confirm.dto';
import type { PasswordResetConfirmEntity } from '../entities/password-reset-confirm.entity';

const repository = new PasswordResetConfirmRepositoryImpl();

const MUTATION_KEYS = {
  passwordResetConfirm: ['auth', 'password-reset', 'confirm'] as const,
};

export function usePasswordResetConfirm() {
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
    PasswordResetConfirmEntity,
    Error,
    PasswordResetConfirmRequestDto
  >({
    mutationKey: MUTATION_KEYS.passwordResetConfirm,
    mutationFn: (payload: PasswordResetConfirmRequestDto) =>
      repository.confirm(payload),
    onSuccess: () => {
      // Invalidation des sessions existantes après réinitialisation : on
      // purge les tokens stockés côté client.
      clearTokens();
    },
  });

  return {
    passwordResetConfirm: mutate,
    passwordResetConfirmAsync: mutateAsync,
    passwordResetConfirmIsLoading: isPending,
    passwordResetConfirmIsSuccess: isSuccess,
    passwordResetConfirmIsError: isError,
    passwordResetConfirmError: error,
    passwordResetConfirmData: data,
    passwordResetConfirmReset: reset,
  };
}
