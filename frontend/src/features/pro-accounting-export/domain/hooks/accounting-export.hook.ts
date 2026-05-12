import { useMutation } from '@tanstack/react-query';
import AccountingExportRepositoryImpl from '../../data/repositories/accounting-export.repository.impl';
import type { AccountingExportRequestDto } from '../../data/dtos/accounting-export.dto';

const repository = new AccountingExportRepositoryImpl();

export function useCreateAccountingExport() {
  const { mutate, isPending, error, data, reset } = useMutation({
    mutationFn: (data: AccountingExportRequestDto) => repository.create(data),
  });

  return {
    createAccountingExport: mutate,
    createAccountingExportIsPending: isPending,
    createAccountingExportError: error,
    accountingExportResult: data,
    resetAccountingExport: reset,
  };
}
