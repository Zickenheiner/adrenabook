import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SignWaiverDto {
  @ApiProperty({
    description: 'Signature method used',
    example: 'canvas',
    enum: ['canvas', 'otp_sms'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['canvas', 'otp_sms'])
  signatureMethod: 'canvas' | 'otp_sms';

  @ApiProperty({
    description: 'Signature payload: base64 canvas image OR 6-digit OTP code',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  @IsString()
  @IsNotEmpty()
  signaturePayload: string;

  @ApiProperty({
    description:
      "Confirmation that the activity's risks have been read and understood",
    example: true,
  })
  @IsBoolean()
  acknowledgedRisks: boolean;
}

export class SignWaiverResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the signed waiver',
    example: '68b4d59919d9b7a94b4fde21',
  })
  waiverId: string;

  @ApiProperty({
    description: 'Qualified timestamp of the signature (ISO 8601)',
    example: '2026-05-11T09:15:00.000Z',
  })
  signedAt: string;

  @ApiProperty({
    description:
      'SHA-256 hash of the document guaranteeing its integrity (tamper-proof)',
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  })
  documentHash: string;

  // Toujours null : la génération du PDF de la décharge n'est pas encore
  // implémentée. Le champ est conservé pour ne pas casser le contrat une fois
  // la génération disponible. La preuve de signature reste `documentHash`.
  @ApiProperty({
    description:
      'Download URL of the signed document. null as long as PDF generation is not implemented.',
    example: null,
    nullable: true,
    type: String,
  })
  downloadUrl: string | null;
}

export class CreateWaiverDto extends SignWaiverDto {}

export class UpdateWaiverDto {}
