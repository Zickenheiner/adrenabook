import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Identifier of the related booking',
    example: '68b4d59919d9b7a94b4fde21',
  })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: 'Identifier of the owning user',
    example: '68b4d59919d9b7a94b4fde22',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Sequential invoice number',
    example: 'INV-2026-000123',
  })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty({
    description: 'Issue date, ISO 8601',
    example: '2026-05-11T10:00:00.000Z',
  })
  @IsDateString()
  issuedAt: string;

  @ApiProperty({
    description: 'Total amount including tax, in euros',
    example: 120,
  })
  @IsNumber()
  totalEur: number;

  @ApiProperty({ description: 'VAT amount in euros', example: 20 })
  @IsNumber()
  vatEur: number;
}

export class UpdateInvoiceDto {}

export class InvoiceMetadataResponseDto {
  @ApiProperty({
    description: 'Sequential invoice number',
    example: 'INV-2026-000123',
  })
  invoiceNumber: string;

  @ApiProperty({
    description: 'Issue date, ISO 8601',
    example: '2026-05-11T10:00:00.000Z',
  })
  issuedAt: string;

  @ApiProperty({
    description: 'Total amount including tax, in euros',
    example: 120,
  })
  totalEur: number;

  @ApiProperty({ description: 'VAT amount in euros', example: 20 })
  vatEur: number;

  @ApiProperty({
    description: 'Signed URL, valid for 1 hour, to download the PDF',
    example: 'https://example.com/invoices/INV-2026-000123.pdf?token=xxx',
  })
  downloadUrl: string;
}
