import { useQuery } from '@tanstack/react-query';
import InvoiceRepositoryImpl from '../../data/repositories/invoice.repository.impl';

const repository = new InvoiceRepositoryImpl();

const QUERY_KEYS = {
  byBooking: (bookingId: string) => ['invoice', bookingId] as const,
};

export function useInvoice(bookingId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.byBooking(bookingId),
    queryFn: () => repository.getByBookingId(bookingId),
    enabled: !!bookingId,
  });

  return {
    invoice: data,
    invoiceIsLoading: isLoading,
    invoiceError: error,
  };
}
