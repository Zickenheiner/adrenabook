import { useQuery } from '@tanstack/react-query';
import ProBookingRepositoryImpl from '../../data/repositories/pro-booking.repository.impl';

const repository = new ProBookingRepositoryImpl();

export function useCenterBookings(centerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pro-bookings', centerId],
    queryFn: () => repository.getByCenter(centerId),
    enabled: !!centerId,
  });

  return {
    bookings: data,
    bookingsIsLoading: isLoading,
    bookingsError: error,
  };
}
