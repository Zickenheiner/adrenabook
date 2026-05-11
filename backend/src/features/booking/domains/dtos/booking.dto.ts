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
    description: 'Prénom du participant',
    example: 'Jean',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Nom du participant',
    example: 'Dupont',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Date de naissance au format ISO 8601 (YYYY-MM-DD)',
    example: '1990-05-15',
  })
  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    description:
      'Poids en kilogrammes (optionnel, requis pour certaines activités)',
    example: 75,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  weightKg?: number;
}

export class CreateBookingDto {
  @ApiProperty({
    description: 'Identifiant du créneau à réserver',
    example: '68b4d59919d9b7a94b4fde21',
  })
  @IsString()
  @IsNotEmpty()
  slotId: string;

  @ApiProperty({
    description: 'Liste des participants (au moins 1)',
    type: [ParticipantDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];

  @ApiProperty({
    description: 'Acceptation des conditions spécifiques au centre',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acceptCenterTerms: boolean;
}

export class UpdateBookingDto {}

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Identifiant du PaymentIntent Stripe',
    example: 'pi_3OxxxxxxxxxxxxxxxxxxxxXX',
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}

export class ConfirmPaymentResponseDto {
  @ApiProperty({
    description: 'Identifiant de la reservation',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Statut du paiement',
    example: 'confirmed',
    enum: ['confirmed', 'partial_paid'],
  })
  status: 'confirmed' | 'partial_paid';

  @ApiProperty({
    description: 'Montant paye en euros',
    example: 36.0,
  })
  paidAmountEur: number;

  @ApiProperty({
    description: 'Montant restant a payer en euros',
    example: 84.0,
  })
  remainingAmountEur: number;

  @ApiProperty({
    description: 'Date limite pour le paiement du solde (ISO 8601, J-7)',
    example: '2026-06-04T10:00:00.000Z',
    required: false,
  })
  finalPaymentDueAt?: string;
}

export class CancelBookingDto {
  @ApiProperty({
    description: "Motif de l'annulation",
    example: 'personal',
    enum: ['personal', 'health', 'weather', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['personal', 'health', 'weather', 'other'])
  reason: 'personal' | 'health' | 'weather' | 'other';

  @ApiProperty({
    description: "Commentaire libre sur l'annulation",
    example: 'Empêchement de dernière minute',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class CancelBookingResponseDto {
  @ApiProperty({
    description: 'Identifiant de la réservation annulée',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Statut de la réservation après annulation',
    example: 'cancelled',
  })
  status: 'cancelled';

  @ApiProperty({
    description: 'Montant remboursé en euros',
    example: 120.0,
  })
  refundedAmountEur: number;

  @ApiProperty({
    description: 'Règle de remboursement appliquée',
    example: 'full',
    enum: ['full', 'partial', 'none'],
  })
  refundPolicyApplied: 'full' | 'partial' | 'none';

  @ApiProperty({
    description: 'Délai estimé de remboursement',
    example: '5-10 jours ouvrés',
  })
  refundEta: string;
}

export class BookingResponseDto {
  @ApiProperty({
    description: 'Identifiant de la réservation créée',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Statut initial de la réservation',
    example: 'pending_payment',
  })
  status: 'pending_payment';

  @ApiProperty({
    description:
      "Date d'expiration de la réservation temporaire (ISO 8601, +15 min)",
    example: '2026-05-11T09:15:00.000Z',
  })
  reservationExpiresAt: string;

  @ApiProperty({
    description: 'Montant total en euros',
    example: 120.0,
  })
  totalEur: number;

  @ApiProperty({
    description: 'Montant TVA en euros',
    example: 20.0,
  })
  vatEur: number;

  @ApiProperty({
    description: 'Client secret Stripe pour finaliser le paiement',
    example: 'pi_3Oxxxxxx_secret_xxxxxx',
  })
  paymentIntentClientSecret: string;
}
