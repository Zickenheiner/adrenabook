import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
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
