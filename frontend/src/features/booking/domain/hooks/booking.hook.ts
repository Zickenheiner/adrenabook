import { useMutation } from '@tanstack/react-query';
import BookingRepositoryImpl from '../../data/repositories/booking.repository.impl';
import type { CreateBookingRequestDto } from '../../data/dtos/booking.dto';

const repository = new BookingRepositoryImpl();

export function useCreateBooking() {
  const { mutate, mutateAsync, isPending, error, data } = useMutation({
    mutationFn: (data: CreateBookingRequestDto) => repository.create(data),
  });

  return {
    createBooking: mutate,
    createBookingAsync: mutateAsync,
    createBookingIsPending: isPending,
    createBookingError: error,
    booking: data,
  };
}
