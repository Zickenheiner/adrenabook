import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import HealthProfileRepositoryImpl from '../../data/repositories/health-profile.repository.impl';
import type { HealthProfileRequestDto } from '../../data/dtos/health-profile.dto';

const repository = new HealthProfileRepositoryImpl();

const QUERY_KEYS = {
  all: ['healthProfile'] as const,
};

export const emergencyContactSchema = z.object({
  fullName: z.string().min(1, 'Le nom complet est requis'),
  relation: z.string().min(1, 'La relation est requise'),
  phone: z
    .string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
    .regex(/^[+\d\s\-()]+$/, 'Format de téléphone invalide'),
});

export const healthProfileSchema = z.object({
  weight: z.number().min(20).max(300).optional(),
  height: z.number().min(50).max(250).optional(),
  medicalContraindications: z.array(z.string()).optional(),
  emergencyContact: emergencyContactSchema,
  medicalCertificateFileId: z.string().optional(),
});

export type HealthProfileFormData = z.infer<typeof healthProfileSchema>;

export function useUpdateHealthProfile() {
  const { mutate, isPending, isError, isSuccess, error, data } = useMutation({
    mutationFn: (data: HealthProfileRequestDto) => repository.update(data),
    onSuccess: () => {
      // No list to invalidate — single user resource
    },
  });

  return {
    updateHealthProfile: mutate,
    updateHealthProfileIsPending: isPending,
    updateHealthProfileIsError: isError,
    updateHealthProfileIsSuccess: isSuccess,
    updateHealthProfileError: error,
    updateHealthProfileData: data,
  };
}

export { QUERY_KEYS as healthProfileQueryKeys };
