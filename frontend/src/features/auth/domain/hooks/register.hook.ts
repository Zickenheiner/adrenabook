import { useMutation } from '@tanstack/react-query';
import RegisterRepositoryImpl from '../../data/repositories/register.repository.impl';
import type { RegisterRequestDto } from '../../data/dtos/register.dto';
import type { RegisterEntity } from '../entities/register.entity';

const repository = new RegisterRepositoryImpl();

const MUTATION_KEYS = {
  register: ['auth', 'register'] as const,
};

export function useRegister() {
  const {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  } = useMutation<RegisterEntity, Error, RegisterRequestDto>({
    mutationKey: MUTATION_KEYS.register,
    mutationFn: (payload: RegisterRequestDto) => repository.register(payload),
  });

  return {
    register: mutate,
    registerAsync: mutateAsync,
    registerIsLoading: isPending,
    registerIsSuccess: isSuccess,
    registerIsError: isError,
    registerError: error,
    registerData: data,
    registerReset: reset,
  };
}
