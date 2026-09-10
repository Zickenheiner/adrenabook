import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SignWaiverDto {
  @ApiProperty({
    description: 'Méthode de signature utilisée',
    example: 'canvas',
    enum: ['canvas', 'otp_sms'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['canvas', 'otp_sms'])
  signatureMethod: 'canvas' | 'otp_sms';

  @ApiProperty({
    description:
      'Payload de la signature : base64 du canvas OU code OTP à 6 chiffres',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  @IsString()
  @IsNotEmpty()
  signaturePayload: string;

  @ApiProperty({
    description:
      "Confirmation de la prise de connaissance des risques de l'activité",
    example: true,
  })
  @IsBoolean()
  acknowledgedRisks: boolean;
}

export class SignWaiverResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la décharge signée',
    example: '68b4d59919d9b7a94b4fde21',
  })
  waiverId: string;

  @ApiProperty({
    description: 'Horodatage qualifié de la signature (ISO 8601)',
    example: '2026-05-11T09:15:00.000Z',
  })
  signedAt: string;

  @ApiProperty({
    description:
      'Hash SHA-256 du document pour garantir son intégrité (tamper-proof)',
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  })
  documentHash: string;

  // Toujours null : la génération du PDF de la décharge n'est pas encore
  // implémentée. Le champ est conservé pour ne pas casser le contrat une fois
  // la génération disponible. La preuve de signature reste `documentHash`.
  @ApiProperty({
    description:
      "URL de téléchargement du document signé. null tant que la génération du PDF n'est pas implémentée.",
    example: null,
    nullable: true,
    type: String,
  })
  downloadUrl: string | null;
}

export class CreateWaiverDto extends SignWaiverDto {}

export class UpdateWaiverDto {}
