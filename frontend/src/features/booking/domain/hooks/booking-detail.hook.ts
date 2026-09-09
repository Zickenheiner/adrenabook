import { useQuery } from '@tanstack/react-query';
import BookingDetailRepositoryImpl from '../../data/repositories/booking-detail.repository.impl';

const repository = new BookingDetailRepositoryImpl();

const QUERY_KEYS = {
  booking: (id: string) => ['bookings', id] as const,
};

export function useBookingDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.booking(id),
    queryFn: () => repository.getById(id),
    enabled: !!id,
    retry: false,
  });

  return {
    booking: data,
    bookingIsLoading: isLoading,
    bookingError: error,
  };
}
