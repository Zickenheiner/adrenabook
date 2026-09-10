import { useMutation, useQueryClient } from '@tanstack/react-query';
import PaymentRepositoryImpl from '../../data/repositories/payment.repository.impl';
import type { ConfirmPaymentRequestDto } from '../../data/dtos/payment.dto';

const repository = new PaymentRepositoryImpl();

const QUERY_KEYS = {
  booking: (id: string) => ['bookings', id] as const,
};

export function useConfirmPayment(bookingId: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, data } = useMutation({
    mutationFn: (data: ConfirmPaymentRequestDto) =>
      repository.confirmPayment(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.booking(bookingId),
      });
    },
  });

  return {
    confirmPayment: mutate,
    confirmPaymentIsPending: isPending,
    confirmPaymentError: error,
    paymentConfirmation: data,
  };
}
