import { useMutation } from '@tanstack/react-query';
import WaiverRepositoryImpl from '../../data/repositories/waiver.repository.impl';
import type { SignWaiverRequestDto } from '../../data/dtos/waiver.dto';

const repository = new WaiverRepositoryImpl();

const QUERY_KEYS = {
  waiver: (bookingId: string) => ['waiver', bookingId] as const,
};

export { QUERY_KEYS as waiverQueryKeys };

export function useSignWaiver(bookingId: string) {
  const { mutate, isPending, error, data, isSuccess } = useMutation({
    mutationFn: (payload: SignWaiverRequestDto) =>
      repository.sign(bookingId, payload),
  });

  return {
    signWaiver: mutate,
    signWaiverIsPending: isPending,
    signWaiverError: error,
    signedWaiver: data,
    signWaiverIsSuccess: isSuccess,
  };
}
