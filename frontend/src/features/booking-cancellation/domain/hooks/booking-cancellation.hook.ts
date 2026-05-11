import { useMutation, useQueryClient } from '@tanstack/react-query';
import BookingCancellationRepositoryImpl from '../../data/repositories/booking-cancellation.repository.impl';
import type { CancelBookingRequestDto } from '../../data/dtos/booking-cancellation.dto';

const repository = new BookingCancellationRepositoryImpl();

const QUERY_KEYS = {
  bookings: ['bookings'] as const,
};

export function useCancelBooking() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, data } = useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: CancelBookingRequestDto;
    }) => repository.cancel(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings });
    },
  });

  return {
    cancelBooking: mutate,
    cancelBookingIsPending: isPending,
    cancelBookingError: error,
    cancellationResult: data,
  };
}
