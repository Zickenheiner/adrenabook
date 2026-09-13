import {
  MyBookingDto,
  PaymentIntentResponseDto,
} from '@features/booking/domains/dtos/booking.dto';
import {
  BookingDetailResponseDto,
  CancelBookingDto,
  CancelBookingResponseDto,
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';
import { BookingEntity } from '@features/booking/domains/entities/booking.entity';

export interface IBookingRepository {
  create(dto: CreateBookingDto, userId: string): Promise<BookingEntity | null>;
  findById(id: string): Promise<BookingEntity | null>;
  findDetailById(id: string, userId: string): Promise<BookingDetailResponseDto>;
  findBySlotId(slotId: string): Promise<BookingEntity[] | null>;
  /** Reservations de l'utilisateur, de la plus proche a la plus lointaine. */
  findMine(userId: string, bookingId?: string): Promise<MyBookingDto[]>;

  /** Prepare le paiement d'une reservation et renvoie sa reference. */
  createPaymentIntent(
    id: string,
    userId: string,
  ): Promise<PaymentIntentResponseDto>;

  confirmPayment(
    id: string,
    dto: ConfirmPaymentDto,
  ): Promise<ConfirmPaymentResponseDto>;
  cancelBooking(
    id: string,
    dto: CancelBookingDto,
    userId: string,
  ): Promise<CancelBookingResponseDto>;
}
