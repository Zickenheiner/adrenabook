import { useMutation } from '@tanstack/react-query';
import LoginRepositoryImpl from '../../data/repositories/login.repository.impl';
import { setAccessToken, setRefreshToken } from '@/core/local/storage';
import type { LoginRequestDto } from '../../data/dtos/login.dto';
import type { LoginEntity } from '../entities/login.entity';

const repository = new LoginRepositoryImpl();

const MUTATION_KEYS = {
  login: ['auth', 'login'] as const,
};

export function useLogin() {
  const {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  } = useMutation<LoginEntity, Error, LoginRequestDto>({
    mutationKey: MUTATION_KEYS.login,
    mutationFn: (payload: LoginRequestDto) => repository.login(payload),
    onSuccess: (result) => {
      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken);
    },
  });

  return {
    login: mutate,
    loginAsync: mutateAsync,
    loginIsLoading: isPending,
    loginIsSuccess: isSuccess,
    loginIsError: isError,
    loginError: error,
    loginData: data,
    loginReset: reset,
  };
}
