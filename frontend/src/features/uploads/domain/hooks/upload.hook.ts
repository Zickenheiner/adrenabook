import { useMutation } from '@tanstack/react-query';
import UploadRepositoryImpl from '../../data/repositories/upload.repository.impl';

const repository = new UploadRepositoryImpl();

export function useUploadDocument() {
  const { mutateAsync, isPending, error, reset } = useMutation({
    mutationFn: (file: File) => repository.upload(file),
  });

  return {
    uploadDocument: mutateAsync,
    uploadIsPending: isPending,
    uploadError: error,
    resetUpload: reset,
  };
}
