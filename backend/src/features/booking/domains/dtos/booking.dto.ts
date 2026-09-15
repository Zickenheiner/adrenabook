import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipantDto {
  @ApiProperty({
    description: 'Participant first name',
    example: 'Jean',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Participant last name',
    example: 'Dupont',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Date of birth in ISO 8601 format (YYYY-MM-DD)',
    example: '1990-05-15',
  })
  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    description: 'Weight in kilograms (optional, required for some activities)',
    example: 75,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  weightKg?: number;
}

export class CreateBookingDto {
  @ApiProperty({
    description: 'Identifier of the slot to book',
    example: '68b4d59919d9b7a94b4fde21',
  })
  @IsString()
  @IsNotEmpty()
  slotId: string;

  @ApiProperty({
    description: 'List of participants (at least 1)',
    type: [ParticipantDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];

  @ApiProperty({
    description: "Acceptance of the center's specific terms",
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acceptCenterTerms: boolean;
}

export class UpdateBookingDto {}

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Stripe PaymentIntent identifier',
    example: 'pi_3OxxxxxxxxxxxxxxxxxxxxXX',
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}

/**
 * Reference de paiement remise au client avant de confirmer.
 *
 * En attendant l'integration Stripe, elle est produite ici plutot que par un
 * PaymentIntent : elle sert de trace, et le parcours reste inchange le jour ou
 * Stripe la remplacera.
 */
export class PaymentIntentResponseDto {
  @ApiProperty({
    description: 'Booking identifier',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Payment reference to send back at confirmation',
    example: 'sim_68b4d59919d9b7a94b4fde21_1757770000000',
  })
  paymentIntentId: string;

  @ApiProperty({
    description: 'Amount to pay, in euros',
    example: 90,
  })
  amountEur: number;

  @ApiProperty({
    description: 'True as long as the payment has not been collected by Stripe',
    example: true,
  })
  simulated: boolean;
}

/**
 * Reservation telle qu'elle apparait dans « Mes reservations ».
 *
 * Porte de quoi decider de la suite sans ouvrir le detail : l'etat du
 * paiement, celui de la decharge, et la date qui conditionne l'annulation.
 */
export class MyBookingDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  bookingId: string;

  @ApiProperty({ example: 'Parapente biplace' })
  activityTitle: string;

  @ApiProperty({ example: '68b4d59919d9b7a94b4fde30' })
  activityId: string;

  @ApiProperty({ example: 'Chamonix Vertical' })
  centerName: string;

  @ApiProperty({ example: '12 rue des Alpes, 74400 Chamonix, France' })
  centerAddress: string;

  @ApiProperty({ example: '2026-09-05T09:00:00.000Z' })
  slotStartAt: string;

  @ApiProperty({ example: 90 })
  durationMinutes: number;

  @ApiProperty({ example: 2 })
  participants: number;

  @ApiProperty({
    example: 'confirmed',
    enum: ['pending_payment', 'partial_paid', 'confirmed', 'cancelled'],
  })
  status: string;

  @ApiProperty({ example: 240 })
  totalEur: number;

  @ApiProperty({ example: 240 })
  paidAmountEur: number;

  @ApiProperty({ example: 0 })
  remainingAmountEur: number;

  @ApiProperty({ example: true })
  waiverSigned: boolean;

  @ApiProperty({ example: '68b4d59919d9b7a94b4fde99' })
  coverPhotoUrl: string;

  @ApiProperty({
    description: 'Payment deadline, for a pending booking',
    example: '2026-08-20T12:15:00.000Z',
    required: false,
  })
  reservationExpiresAt?: string;
}

export class ConfirmPaymentResponseDto {
  @ApiProperty({
    description: 'Booking identifier',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'confirmed',
    enum: ['confirmed', 'partial_paid'],
  })
  status: 'confirmed' | 'partial_paid';

  @ApiProperty({
    description: 'Amount paid in euros',
    example: 36.0,
  })
  paidAmountEur: number;

  @ApiProperty({
    description: 'Remaining amount to pay in euros',
    example: 84.0,
  })
  remainingAmountEur: number;
}

export class CancelBookingDto {
  @ApiProperty({
    description: 'Cancellation reason',
    example: 'personal',
    enum: ['personal', 'health', 'weather', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['personal', 'health', 'weather', 'other'])
  reason: 'personal' | 'health' | 'weather' | 'other';

  @ApiProperty({
    description: 'Free-text comment about the cancellation',
    example: 'Empêchement de dernière minute',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class CancelBookingResponseDto {
  @ApiProperty({
    description: 'Identifier of the cancelled booking',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Booking status after cancellation',
    example: 'cancelled',
  })
  status: 'cancelled';

  @ApiProperty({
    description: 'Refunded amount in euros',
    example: 120.0,
  })
  refundedAmountEur: number;

  @ApiProperty({
    description:
      'Refund rule applied according to the terms and conditions, regardless of the amount actually collected',
    example: 'full',
    enum: ['full', 'partial', 'none'],
  })
  refundPolicyApplied: 'full' | 'partial' | 'none';

  @ApiProperty({
    description:
      'Message intended for the user: refund lead time when an amount is refunded, otherwise an explicit reason (cancellation too late or no payment collected)',
    example: 'Remboursement effectué sous 5 à 10 jours ouvrés',
  })
  refundEta: string;
}

export class BookingParticipantSummaryDto {
  @ApiProperty({
    description: 'Participant first name',
    example: 'Jean',
  })
  firstName: string;

  @ApiProperty({
    description: 'Participant last name',
    example: 'Dupont',
  })
  lastName: string;
}

export class BookingDetailResponseDto {
  @ApiProperty({
    description: 'Booking identifier',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Current booking status',
    example: 'pending_payment',
    enum: [
      'pending_payment',
      'confirmed',
      'partial_paid',
      'cancelled',
      'completed',
    ],
  })
  status:
    | 'pending_payment'
    | 'confirmed'
    | 'partial_paid'
    | 'cancelled'
    | 'completed';

  @ApiProperty({
    description:
      'Expiry date of the temporary booking (ISO 8601). null once the booking no longer expires (payment collected, cancellation, or activity completed).',
    example: '2026-05-11T09:15:00.000Z',
    nullable: true,
    type: String,
  })
  reservationExpiresAt: string | null;

  @ApiProperty({
    description: 'Total amount in euros',
    example: 120.0,
  })
  totalEur: number;

  @ApiProperty({
    description: 'VAT amount in euros',
    example: 20.0,
  })
  vatEur: number;

  @ApiProperty({
    description: 'Participants registered on the booking',
    type: [BookingParticipantSummaryDto],
  })
  participants: BookingParticipantSummaryDto[];

  @ApiProperty({
    description: 'Title of the booked activity',
    example: 'Saut en parachute tandem',
  })
  activityTitle: string;

  @ApiProperty({
    description: 'Start date and time of the booked slot (ISO 8601)',
    example: '2026-09-16T09:00:00.000Z',
  })
  slotStartAt: string;

  @ApiProperty({
    description: 'Whether the liability waiver has been signed',
    example: false,
  })
  waiverSigned: boolean;
}

export class BookingResponseDto {
  @ApiProperty({
    description: 'Identifier of the created booking',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Initial booking status',
    example: 'pending_payment',
  })
  status: 'pending_payment';

  @ApiProperty({
    description: 'Expiry date of the temporary booking (ISO 8601, +15 min)',
    example: '2026-05-11T09:15:00.000Z',
  })
  reservationExpiresAt: string;

  @ApiProperty({
    description: 'Total amount in euros',
    example: 120.0,
  })
  totalEur: number;

  @ApiProperty({
    description: 'VAT amount in euros',
    example: 20.0,
  })
  vatEur: number;

  @ApiProperty({
    description: 'Stripe client secret to complete the payment',
    example: 'pi_3Oxxxxxx_secret_xxxxxx',
  })
  paymentIntentClientSecret: string;
}
