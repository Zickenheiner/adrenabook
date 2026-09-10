import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'ID de la réservation associée',
    example: '68b4d59919d9b7a94b4fde21',
  })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: "ID de l'utilisateur propriétaire",
    example: '68b4d59919d9b7a94b4fde22',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Numéro de facture séquentiel',
    example: 'INV-2026-000123',
  })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty({
    description: "Date d'émission ISO 8601",
    example: '2026-05-11T10:00:00.000Z',
  })
  @IsDateString()
  issuedAt: string;

  @ApiProperty({ description: 'Montant total TTC en euros', example: 120 })
  @IsNumber()
  totalEur: number;

  @ApiProperty({ description: 'Montant TVA en euros', example: 20 })
  @IsNumber()
  vatEur: number;
}

export class UpdateInvoiceDto {}

export class InvoiceMetadataResponseDto {
  @ApiProperty({
    description: 'Numéro de facture séquentiel',
    example: 'INV-2026-000123',
  })
  invoiceNumber: string;

  @ApiProperty({
    description: "Date d'émission ISO 8601",
    example: '2026-05-11T10:00:00.000Z',
  })
  issuedAt: string;

  @ApiProperty({ description: 'Montant total TTC en euros', example: 120 })
  totalEur: number;

  @ApiProperty({ description: 'Montant TVA en euros', example: 20 })
  vatEur: number;

  @ApiProperty({
    description: 'URL signée valable 1h pour télécharger le PDF',
    example: 'https://example.com/invoices/INV-2026-000123.pdf?token=xxx',
  })
  downloadUrl: string;
}
