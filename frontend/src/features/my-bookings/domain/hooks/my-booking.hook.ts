import { useQuery } from '@tanstack/react-query';
import MyBookingRepositoryImpl from '../../data/repositories/my-booking.repository.impl';

const repository = new MyBookingRepositoryImpl();

export function useMyBookings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => repository.getMine(),
  });

  return {
    bookings: data,
    bookingsIsLoading: isLoading,
    bookingsError: error,
  };
}
