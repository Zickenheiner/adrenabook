import { useMutation } from '@tanstack/react-query';
import RgpdRepositoryImpl from '../../data/repositories/rgpd.repository.impl';
import type { RgpdDeleteRequestDto } from '../../data/dtos/rgpd.dto';

const repository = new RgpdRepositoryImpl();

const QUERY_KEYS = {
  export: ['rgpd', 'export'] as const,
  delete: ['rgpd', 'delete'] as const,
};

export function useRequestRgpdExport() {
  const { mutate, isPending, error, data } = useMutation({
    mutationKey: QUERY_KEYS.export,
    mutationFn: () => repository.requestExport(),
  });

  return {
    requestExport: mutate,
    requestExportIsPending: isPending,
    requestExportError: error,
    exportData: data,
  };
}

export function useRequestRgpdDelete() {
  const { mutate, isPending, error, data } = useMutation({
    mutationKey: QUERY_KEYS.delete,
    mutationFn: (payload: RgpdDeleteRequestDto) =>
      repository.requestDelete(payload),
  });

  return {
    requestDelete: mutate,
    requestDeleteIsPending: isPending,
    requestDeleteError: error,
    deleteData: data,
  };
}
