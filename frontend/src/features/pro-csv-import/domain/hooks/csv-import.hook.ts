import { useMutation } from '@tanstack/react-query';
import CsvImportRepositoryImpl from '../../data/repositories/csv-import.repository.impl';
import type { CsvImportRequestDto } from '../../data/dtos/csv-import.dto';

const repository = new CsvImportRepositoryImpl();

export function useCsvImport() {
  const { mutate, mutateAsync, isPending, error, data } = useMutation({
    mutationFn: (data: CsvImportRequestDto) => repository.import(data),
  });

  return {
    importCsv: mutate,
    importCsvAsync: mutateAsync,
    importIsLoading: isPending,
    importError: error,
    importResult: data,
  };
}
