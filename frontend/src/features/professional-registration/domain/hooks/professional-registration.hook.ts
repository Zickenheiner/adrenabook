import { useMutation } from '@tanstack/react-query';
import ProfessionalRegistrationRepositoryImpl from '../../data/repositories/professional-registration.repository.impl';
import type { CreateProfessionalCenterRequestDto } from '../../data/dtos/professional-registration.dto';
import type { ProfessionalRegistrationEntity } from '../entities/professional-registration.entity';

const repository = new ProfessionalRegistrationRepositoryImpl();

const MUTATION_KEYS = {
  create: ['professional-center', 'create'] as const,
};

export function useProfessionalRegistration() {
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
    ProfessionalRegistrationEntity,
    Error,
    CreateProfessionalCenterRequestDto
  >({
    mutationKey: MUTATION_KEYS.create,
    mutationFn: (payload) => repository.create(payload),
  });

  return {
    registerProfessional: mutate,
    registerProfessionalAsync: mutateAsync,
    registerProfessionalIsLoading: isPending,
    registerProfessionalIsSuccess: isSuccess,
    registerProfessionalIsError: isError,
    registerProfessionalError: error,
    registerProfessionalData: data,
    registerProfessionalReset: reset,
  };
}
